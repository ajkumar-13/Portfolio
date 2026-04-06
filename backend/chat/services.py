import logging
import time

from .providers import get_available_provider


logger = logging.getLogger(__name__)


class ChatServiceError(Exception):
    """Base exception for chat service failures."""


class ChatProviderUnavailableError(ChatServiceError):
    """Raised when no upstream chat provider is available."""


class ChatProviderRequestError(ChatServiceError):
    """Raised when an upstream provider request fails."""


def build_system_prompt(blog_post) -> str:
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


def generate_chat_response(blog_post, user_message, history):
    system_prompt = build_system_prompt(blog_post)
    messages = [*history, {'role': 'user', 'content': user_message}]

    try:
        provider = get_available_provider()
    except RuntimeError as exc:
        logger.warning(
            'chat_provider_unavailable',
            extra={
                'blog_slug': blog_post.slug,
            },
        )
        raise ChatProviderUnavailableError('No chat providers are currently available.') from exc

    started_at = time.perf_counter()

    try:
        reply = provider.chat(system_prompt, messages)
    except Exception as exc:
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.exception(
            'chat_provider_request_failed',
            extra={
                'provider': provider.name,
                'blog_slug': blog_post.slug,
                'duration_ms': duration_ms,
            },
        )
        raise ChatProviderRequestError('Failed to complete chat request.') from exc

    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    logger.info(
        'chat_response_generated',
        extra={
            'provider': provider.name,
            'blog_slug': blog_post.slug,
            'duration_ms': duration_ms,
            'history_messages': len(history),
        },
    )

    return {
        'reply': reply,
        'provider': provider.name,
        'message': {'role': 'assistant', 'content': reply},
    }
