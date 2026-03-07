"""
chat/views.py — Chat API Endpoint (Multi-Provider AI)

──────────────────────────────────────────────────────────────────────────────
WHAT THIS FILE DOES
──────────────────────────────────────────────────────────────────────────────
Handles POST /api/chat/ requests from the React frontend.

Provider selection happens automatically in providers.py:
  Priority: Claude → Gemini → OpenAI → Ollama

This view doesn't need to know WHICH provider is used — it just calls
get_available_provider() and uses the result. If you add a new provider
later, only providers.py needs to change.

THE RESPONSE INCLUDES THE PROVIDER NAME
──────────────────────────────────────────────────────────────────────────────
The JSON response includes a 'provider' field so the frontend can optionally
show which AI answered (e.g., "Answered by Gemini (gemini-2.0-flash)").
──────────────────────────────────────────────────────────────────────────────
"""

import json
import logging

from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from blog.models import BlogPost
from .providers import get_available_provider

logger = logging.getLogger(__name__)


def build_system_prompt(blog_post) -> str:
    """
    Builds the system prompt that gets sent to the AI as context.

    The system prompt contains:
      1. The AI's role and instructions
      2. The full blog post content in Markdown format

    This is defined as a module-level function (not inside the class)
    so it can be reused or tested independently from the view logic.
    """
    return f"""You are a helpful AI assistant embedded in a technical blog post.
Your job is to help readers understand the content of the article they are reading.

Here is the article the user is currently reading:

Title: {blog_post.title}
Series: {blog_post.series.title}

---

{blog_post.content}

---

Guidelines:
- Answer questions based on the content of this article
- If the question is not covered in the article, say so honestly and provide a brief general answer
- Keep answers concise and technically accurate
- Use examples from the article when relevant
- If the user asks about code, explain it step by step"""


@method_decorator(csrf_exempt, name='dispatch')
class ChatView(View):
    """
    Handles POST /api/chat/

    Request body (JSON):
      {
        "blog_slug": "attention-mechanisms",
        "message": "What is softmax?",
        "history": [
          {"role": "user", "content": "..."},
          {"role": "assistant", "content": "..."}
        ]
      }

    Response (JSON):
      {
        "reply": "Softmax is...",
        "provider": "Claude (claude-sonnet-4-6)",
        "message": {"role": "assistant", "content": "Softmax is..."}
      }
    """

    def post(self, request):
        try:
            # ── Parse request ──────────────────────────────────────────────────
            data = json.loads(request.body)

            blog_slug = data.get('blog_slug')
            user_message = data.get('message', '').strip()
            # history: previous turns in the conversation
            # Format: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
            history = data.get('history', [])

            if not blog_slug:
                return JsonResponse({'error': 'blog_slug is required'}, status=400)
            if not user_message:
                return JsonResponse({'error': 'message is required'}, status=400)

            # ── Fetch blog post ────────────────────────────────────────────────
            try:
                blog_post = BlogPost.objects.select_related('series').get(slug=blog_slug)
            except BlogPost.DoesNotExist:
                return JsonResponse({'error': f'Blog post "{blog_slug}" not found'}, status=404)

            # ── Build context ──────────────────────────────────────────────────
            system_prompt = build_system_prompt(blog_post)

            # Full conversation: all history + the current user message
            messages = [
                *history,
                {"role": "user", "content": user_message},
            ]

            # ── Select provider and call AI ────────────────────────────────────
            # get_available_provider() returns the first available provider
            # in priority order (Claude → Gemini → OpenAI → Ollama).
            # It raises RuntimeError if no providers are configured.
            try:
                provider = get_available_provider()
                reply = provider.chat(system_prompt, messages)
                provider_name = provider.name
            except RuntimeError as e:
                # No providers configured at all
                return JsonResponse({'error': str(e)}, status=503)

            # ── Return response ────────────────────────────────────────────────
            return JsonResponse({
                'reply': reply,
                # Tell the frontend which provider answered (optional, for display)
                'provider': provider_name,
                'message': {'role': 'assistant', 'content': reply},
            })

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            logger.exception(f"Unexpected error in ChatView: {e}")
            return JsonResponse({'error': str(e)}, status=500)
