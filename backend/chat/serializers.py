from django.conf import settings
from rest_framework import serializers


class ChatHistoryMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'assistant'])
    content = serializers.CharField(
        allow_blank=True,
        max_length=settings.CHAT_HISTORY_MESSAGE_MAX_LENGTH,
        trim_whitespace=True,
    )

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('History message content cannot be blank.')
        return value


class ChatRequestSerializer(serializers.Serializer):
    blog_slug = serializers.SlugField(max_length=300)
    message = serializers.CharField(
        allow_blank=True,
        max_length=settings.CHAT_MESSAGE_MAX_LENGTH,
        trim_whitespace=True,
    )
    history = ChatHistoryMessageSerializer(many=True, required=False, default=list)

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('message is required')
        return value

    def validate_history(self, value):
        if len(value) > settings.CHAT_HISTORY_MAX_MESSAGES:
            raise serializers.ValidationError(
                f'History is limited to {settings.CHAT_HISTORY_MAX_MESSAGES} messages.'
            )
        return value
