import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from blog.models import BlogPost
from .serializers import ChatRequestSerializer
from .services import (
    ChatProviderRequestError,
    ChatProviderUnavailableError,
    generate_chat_response,
)
from .throttles import ChatRateThrottle

logger = logging.getLogger(__name__)


def flatten_error_detail(detail):
    if isinstance(detail, list):
        return flatten_error_detail(detail[0]) if detail else 'Invalid request.'

    if isinstance(detail, dict):
        first_value = next(iter(detail.values()), 'Invalid request.')
        return flatten_error_detail(first_value)

    return str(detail)


class ChatView(APIView):
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

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ChatRateThrottle]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': flatten_error_detail(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        blog_slug = serializer.validated_data['blog_slug']
        user_message = serializer.validated_data['message']
        history = [dict(item) for item in serializer.validated_data.get('history', [])]

        logger.info(
            'chat_request_received',
            extra={
                'blog_slug': blog_slug,
                'history_messages': len(history),
                'message_length': len(user_message),
            },
        )

        try:
            blog_post = BlogPost.objects.select_related('series').get(slug=blog_slug)
        except BlogPost.DoesNotExist:
            return Response(
                {'error': f'Blog post "{blog_slug}" not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            result = generate_chat_response(blog_post, user_message, history)
        except ChatProviderUnavailableError:
            return Response(
                {'error': 'Chat service is currently unavailable.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ChatProviderRequestError:
            return Response(
                {'error': 'Failed to generate chat response.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(result, status=status.HTTP_200_OK)
