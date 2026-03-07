"""
chat/providers.py — Multi-Provider LLM Abstraction

──────────────────────────────────────────────────────────────────────────────
WHAT THIS FILE DOES
──────────────────────────────────────────────────────────────────────────────
Defines a unified interface for multiple AI providers, with an automatic
fallback chain:

  Priority: Claude → Gemini → OpenAI → Ollama (local)

The system checks which providers are available (API key present, or Ollama
server reachable) and uses the highest-priority one.

DESIGN PATTERN: Strategy + Abstract Base Class
──────────────────────────────────────────────────────────────────────────────
We use an Abstract Base Class (ABC) to define a contract:
  "Every provider MUST implement is_available() and chat()"

This is the "Strategy Pattern" — the calling code (views.py) doesn't need
to know WHICH provider it's using; it just calls provider.chat(...) and
gets back a string. Swapping providers requires no changes in views.py.

ABC = Abstract Base Class (from Python's abc module)
  - @abstractmethod marks methods that subclasses MUST implement
  - Trying to instantiate a class with unimplemented abstract methods raises TypeError
──────────────────────────────────────────────────────────────────────────────
"""

import os
import logging
from abc import ABC, abstractmethod

# Python's built-in logging module — better than print() for server-side messages.
# getLogger(__name__) creates a logger named after this module ("chat.providers").
logger = logging.getLogger(__name__)


# ── Abstract Base Class ────────────────────────────────────────────────────────

class LLMProvider(ABC):
    """
    Abstract base class for all LLM providers.

    All providers must implement:
      - name (property): display name, e.g. "Claude"
      - is_available(): returns True if this provider can be used right now
      - chat(system_prompt, messages): sends a chat request, returns response text
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name, e.g. 'Claude (claude-sonnet-4-6)'"""
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """
        Returns True if this provider is ready to use.
        For API-based providers: checks if the API key env var is set.
        For Ollama: checks if the local server is running.
        """
        ...

    @abstractmethod
    def chat(self, system_prompt: str, messages: list) -> str:
        """
        Send a chat request and return the response text.

        Args:
            system_prompt: Instructions + blog content for the AI
            messages: Conversation history + current user message
                      Format: [{"role": "user", "content": "..."}, ...]

        Returns:
            The AI's response as a plain string.

        Raises:
            Exception if the API call fails.
        """
        ...


# ── Claude (Anthropic) ─────────────────────────────────────────────────────────

class ClaudeProvider(LLMProvider):
    """
    Claude by Anthropic.
    Requires: ANTHROPIC_API_KEY environment variable.
    Default model: claude-sonnet-4-6 (configurable via CLAUDE_MODEL env var)

    Claude uses a special 'system' parameter separate from the messages array.
    This keeps the context clean and the system instructions always in scope.
    """

    @property
    def name(self) -> str:
        model = os.environ.get('CLAUDE_MODEL', 'claude-sonnet-4-6')
        return f"Claude ({model})"

    def is_available(self) -> bool:
        # An API key is present only if the env var is set AND not the placeholder value
        key = os.environ.get('ANTHROPIC_API_KEY', '')
        return bool(key and key != 'your-api-key-here')

    def chat(self, system_prompt: str, messages: list) -> str:
        import anthropic  # Import here so missing package only fails for this provider

        client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))
        model = os.environ.get('CLAUDE_MODEL', 'claude-sonnet-4-6')

        response = client.messages.create(
            model=model,
            max_tokens=1024,
            system=system_prompt,  # Claude has a dedicated 'system' field
            messages=messages,
        )

        # response.content is a list of content blocks; we want the text of the first
        return response.content[0].text


# ── Gemini (Google) ────────────────────────────────────────────────────────────

class GeminiProvider(LLMProvider):
    """
    Gemini by Google.
    Requires: GOOGLE_API_KEY environment variable.
    Default model: gemini-2.0-flash (fast and capable; configurable via GEMINI_MODEL)

    Gemini's API differs from Claude's: the system prompt is passed as
    'system_instruction' when creating the model, and the conversation
    history uses slightly different formatting.
    """

    @property
    def name(self) -> str:
        model = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')
        return f"Gemini ({model})"

    def is_available(self) -> bool:
        key = os.environ.get('GOOGLE_API_KEY', '')
        return bool(key and key != 'your-api-key-here')

    def chat(self, system_prompt: str, messages: list) -> str:
        import google.generativeai as genai

        genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
        model_name = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')

        # Gemini passes the system prompt as 'system_instruction' on the model object
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt,
        )

        # Convert our standard message format to Gemini's format.
        # Gemini uses 'user'/'model' instead of 'user'/'assistant'.
        # Gemini also requires the conversation to start with a 'user' message
        # and alternate strictly (user, model, user, model...).
        gemini_history = []
        for msg in messages[:-1]:  # All messages except the last one go to history
            gemini_history.append({
                'role': 'user' if msg['role'] == 'user' else 'model',
                'parts': [msg['content']],
            })

        # Start a chat session with the history, then send the latest message
        chat_session = model.start_chat(history=gemini_history)
        last_message = messages[-1]['content']  # The current user question
        response = chat_session.send_message(last_message)

        return response.text


# ── OpenAI ─────────────────────────────────────────────────────────────────────

class OpenAIProvider(LLMProvider):
    """
    GPT models by OpenAI.
    Requires: OPENAI_API_KEY environment variable.
    Default model: gpt-4o-mini (cheap and fast; configurable via OPENAI_MODEL)

    OpenAI's format is the closest to our internal format:
    - system prompt goes as a {"role": "system", "content": "..."} message
    - rest of the conversation follows in the same messages array
    """

    @property
    def name(self) -> str:
        model = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
        return f"OpenAI ({model})"

    def is_available(self) -> bool:
        key = os.environ.get('OPENAI_API_KEY', '')
        return bool(key and key != 'your-api-key-here')

    def chat(self, system_prompt: str, messages: list) -> str:
        from openai import OpenAI

        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        model = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')

        # OpenAI format: system message first, then the conversation history
        # The system prompt is just another message with role="system"
        openai_messages = [
            {"role": "system", "content": system_prompt},
            *messages,  # Spread our existing messages after the system prompt
        ]

        response = client.chat.completions.create(
            model=model,
            max_tokens=1024,
            messages=openai_messages,
        )

        # response.choices[0].message.content is the reply text
        return response.choices[0].message.content


# ── Ollama (Local) ─────────────────────────────────────────────────────────────

class OllamaProvider(LLMProvider):
    """
    Local models via Ollama (runs on your machine, no API key needed).
    Requires: Ollama running at http://localhost:11434
    Default model: llama3.2 (configurable via OLLAMA_MODEL env var)

    HOW TO SET UP OLLAMA:
      1. Install from https://ollama.com
      2. Run: ollama pull llama3.2     (or any other model)
      3. Ollama starts automatically and listens on port 11434

    WHAT IS A VLM (Vision Language Model)?
      You mentioned VLM — this means a model that can understand both
      text and images. For text-only blog chat, regular LLMs work fine.
      To use a VLM like llava, set OLLAMA_MODEL=llava in .env.
    """

    @property
    def name(self) -> str:
        model = os.environ.get('OLLAMA_MODEL', 'llama3.2')
        return f"Ollama/{model} (local)"

    def is_available(self) -> bool:
        """
        Checks if the Ollama server is running by making a quick HTTP request.
        Unlike API-key providers, Ollama's availability depends on whether
        the local server process is running, not an API key.
        """
        try:
            import ollama
            # list() returns available models — if it succeeds, Ollama is running
            ollama.list()
            return True
        except Exception:
            # If anything fails (connection refused, timeout, etc.) Ollama is not available
            return False

    def chat(self, system_prompt: str, messages: list) -> str:
        import ollama

        model = os.environ.get('OLLAMA_MODEL', 'llama3.2')

        # Ollama uses the same message format as OpenAI:
        # system message first, then the conversation
        ollama_messages = [
            {"role": "system", "content": system_prompt},
            *messages,
        ]

        response = ollama.chat(
            model=model,
            messages=ollama_messages,
        )

        # response is a dict-like object; the reply text is at response.message.content
        return response.message.content


# ── Provider Registry ──────────────────────────────────────────────────────────

# The ordered list of all providers — priority is determined by list order.
# Claude first (highest priority), Ollama last (lowest, local fallback).
ALL_PROVIDERS = [
    ClaudeProvider(),
    GeminiProvider(),
    OpenAIProvider(),
    OllamaProvider(),
]


def get_available_provider() -> LLMProvider:
    """
    Returns the first available provider in priority order.

    Iterates through ALL_PROVIDERS and returns the first one whose
    is_available() returns True.

    Raises:
        RuntimeError if NO providers are available (no keys, no Ollama).

    Usage:
        provider = get_available_provider()
        reply = provider.chat(system_prompt, messages)
        print(f"Used: {provider.name}")
    """
    for provider in ALL_PROVIDERS:
        if provider.is_available():
            logger.info(f"Using LLM provider: {provider.name}")
            return provider

    # Build a helpful error message listing what keys are missing
    raise RuntimeError(
        "No LLM providers available. To fix this, do ONE of the following:\n"
        "  • Set ANTHROPIC_API_KEY in backend/.env\n"
        "  • Set GOOGLE_API_KEY in backend/.env\n"
        "  • Set OPENAI_API_KEY in backend/.env\n"
        "  • Install and run Ollama (https://ollama.com) with a model pulled"
    )
