"""
blog/urls.py — URL Routing for the Blog App

──────────────────────────────────────────────────────────────────────────────
WHAT IS A ROUTER?
──────────────────────────────────────────────────────────────────────────────
DRF's DefaultRouter automatically generates URL patterns from a ViewSet.
When you register a ViewSet with a router, it creates these URL patterns:

  router.register('series', BlogSeriesViewSet)  generates:
    GET  /api/series/      → BlogSeriesViewSet.list()
    GET  /api/series/{id}/ → BlogSeriesViewSet.retrieve()

  router.register('blogs', BlogPostViewSet)  generates:
    GET  /api/blogs/          → BlogPostViewSet.list()
    GET  /api/blogs/{slug}/   → BlogPostViewSet.retrieve()
    (slug because we set lookup_field='slug' in the ViewSet)

  The router also generates a browseable API root at /api/ showing all endpoints.
──────────────────────────────────────────────────────────────────────────────
"""

from rest_framework.routers import DefaultRouter
from .views import BlogSeriesViewSet, BlogPostViewSet

# Create the router instance
router = DefaultRouter()

# Register our ViewSets with the router.
# First arg = URL prefix, Second arg = ViewSet class
router.register('series', BlogSeriesViewSet, basename='series')
router.register('blogs', BlogPostViewSet, basename='blogs')

# router.urls is a list of URL patterns that we include in portfolio/urls.py
urlpatterns = router.urls
