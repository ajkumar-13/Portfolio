"""
chat/urls.py — URL Routing for the Chat App

This file defines the URL patterns for the chat feature.
It's a simple file — just one endpoint.

The ChatView handles POST /api/chat/ requests.
"""

from django.urls import path
from .views import ChatView

urlpatterns = [
    # path('route/', ViewClass.as_view(), name='url-name')
    # .as_view() converts a class-based view into a callable that Django can use
    path('', ChatView.as_view(), name='chat'),
]
