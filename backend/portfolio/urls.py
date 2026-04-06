"""
portfolio/urls.py — Root URL Configuration

──────────────────────────────────────────────────────────────────────────────
WHAT IS THIS FILE?
──────────────────────────────────────────────────────────────────────────────
This is the "URL router" for the entire Django project.
Every HTTP request that comes in goes through this file first.

Django matches the request URL against urlpatterns in order, top to bottom.
When it finds a match, it hands the request to the corresponding view.

HOW include() WORKS
──────────────────────────────────────────────────────────────────────────────
include() lets you delegate URL matching to another urls.py file.
  path('api/', include('blog.urls'))
  → any URL starting with 'api/' is passed to blog/urls.py
  → blog/urls.py handles the rest of the path (e.g., 'series/', 'blogs/')

This keeps each app's URLs self-contained and modular.

MEDIA FILES IN DEVELOPMENT
──────────────────────────────────────────────────────────────────────────────
During development, Django can serve uploaded media files (images).
static() adds a URL pattern: GET /media/<filename> → serve from MEDIA_ROOT.
In production, you'd use nginx or a CDN to serve media files instead.
──────────────────────────────────────────────────────────────────────────────
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_url = settings.FRONTEND_URL

urlpatterns = [
    # Django's built-in admin panel — always at /admin/
    path('admin/', admin.site.urls),

    # Health endpoint for uptime checks and basic readiness probes.
    path('health/', include('core.urls')),

    # All blog API endpoints: /api/series/, /api/blogs/, etc.
    # include() delegates the rest of the URL to blog/urls.py
    path('api/', include('blog.urls')),

    # Chat endpoint: /api/chat/
    path('api/chat/', include('chat.urls')),
]

# Serve uploaded media files during development.
# In production, nginx or a cloud storage service handles this.
# settings.DEBUG check ensures this only runs in dev mode.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
