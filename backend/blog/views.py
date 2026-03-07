"""
blog/views.py — API Views for Blog Content

──────────────────────────────────────────────────────────────────────────────
WHAT IS A VIEW?
──────────────────────────────────────────────────────────────────────────────
In Django, a "view" is a function (or class) that:
  1. Receives an HTTP request (GET, POST, PUT, DELETE)
  2. Does some logic (read from DB, validate data, etc.)
  3. Returns an HTTP response (JSON, HTML, etc.)

We use Django REST Framework (DRF) ViewSets, which are a powerful shortcut.

WHAT IS A VIEWSET?
──────────────────────────────────────────────────────────────────────────────
A ViewSet is a class that combines multiple related views into one.
Instead of writing separate functions for list, create, retrieve, update,
and delete, you write one ViewSet class and DRF generates all those endpoints.

ReadOnlyModelViewSet gives you:
  GET /api/series/       → list()     → all series
  GET /api/series/{id}/  → retrieve() → one series

ModelViewSet gives you all of the above PLUS:
  POST   /api/blogs/       → create()
  PUT    /api/blogs/{id}/  → update()
  DELETE /api/blogs/{id}/  → destroy()

HOW DOES DATA GET SERIALIZED TO JSON?
──────────────────────────────────────────────────────────────────────────────
ViewSets use Serializers (defined in serializers.py) to convert:
  Python objects → JSON (for responses)
  JSON → Python objects (for request validation)
──────────────────────────────────────────────────────────────────────────────
"""

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import BlogSeries, BlogPost
from .serializers import BlogSeriesSerializer, BlogSeriesDetailSerializer, BlogPostSerializer


class BlogSeriesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for reading blog series.

    ReadOnlyModelViewSet provides GET endpoints only (list + retrieve).
    We don't expose create/update/delete via the API — those happen
    through the Django admin panel at /admin/.

    Registered routes (via router in urls.py):
      GET /api/series/       → list all series
      GET /api/series/{id}/  → one series with its posts
    """

    # queryset: the default database query for this viewset.
    # prefetch_related('posts') fetches all related posts in a single extra
    # SQL query instead of one query per series (prevents N+1 query problem).
    queryset = BlogSeries.objects.prefetch_related('posts').all()

    # serializer_class: the default serializer used to convert objects to JSON
    serializer_class = BlogSeriesSerializer

    # permission_classes: who is allowed to access these endpoints.
    # AllowAny = anyone (no login required) — appropriate for public blog posts.
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        """
        Use a different serializer depending on whether we're listing
        or retrieving a single series.

        'list' action = GET /api/series/  → show summary (no posts list)
        'retrieve' action = GET /api/series/{id}/ → show full detail with posts
        """
        if self.action == 'retrieve':
            return BlogSeriesDetailSerializer
        return BlogSeriesSerializer


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for reading blog posts.

    Routes registered via router in urls.py:
      GET /api/blogs/         → list all posts (supports ?series_id= filter)
      GET /api/blogs/{slug}/  → single post by slug
    """

    queryset = BlogPost.objects.select_related('series').all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.AllowAny]

    # lookup_field: by default DRF looks up objects by 'pk' (primary key).
    # Changing this to 'slug' means GET /api/blogs/my-post-slug/ works.
    lookup_field = 'slug'

    def get_queryset(self):
        """
        Override get_queryset to support filtering by series.

        If the URL includes ?series_id=3, only return posts from that series.
        If no filter is given, return all posts.

        self.request.query_params is a dict-like object containing URL params.
        """
        queryset = BlogPost.objects.select_related('series').all()

        # Get the 'series_id' query param from the URL (None if not provided)
        series_id = self.request.query_params.get('series_id')
        if series_id is not None:
            queryset = queryset.filter(series_id=series_id)

        return queryset
