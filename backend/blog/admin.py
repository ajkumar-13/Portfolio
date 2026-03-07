"""
blog/admin.py — Django Admin Configuration for Blog Models

──────────────────────────────────────────────────────────────────────────────
WHAT IS DJANGO ADMIN?
──────────────────────────────────────────────────────────────────────────────
Django comes with a built-in admin panel at /admin/ that lets you:
  - Create, read, update, and delete any registered model
  - Manage users and permissions
  - Filter, search, and sort records

You access it by:
  1. Running: uv run python manage.py createsuperuser
  2. Visiting: http://localhost:8000/admin/
  3. Logging in with the superuser credentials

This file controls HOW your models are displayed in the admin panel.
──────────────────────────────────────────────────────────────────────────────
"""

from django.contrib import admin
from .models import BlogSeries, BlogPost


@admin.register(BlogSeries)
class BlogSeriesAdmin(admin.ModelAdmin):
    """
    Admin configuration for BlogSeries.

    @admin.register(BlogSeries) is a decorator — it registers BlogSeriesAdmin
    as the admin class for BlogSeries. It's equivalent to:
        admin.site.register(BlogSeries, BlogSeriesAdmin)
    """

    # list_display: columns shown in the admin list view (/admin/blog/blogseries/)
    list_display = ['title', 'created_at', 'post_count']

    # search_fields: enables a search box that searches these fields
    search_fields = ['title', 'description']

    # readonly_fields: these fields are shown but cannot be edited
    # (auto_now_add fields must always be readonly since Django manages them)
    readonly_fields = ['created_at']

    def post_count(self, obj):
        """
        Custom column showing how many posts are in this series.
        'obj' is the BlogSeries instance for that row.
        obj.posts is the reverse relationship we defined with related_name='posts'.
        """
        return obj.posts.count()

    # This sets the column header label in the admin list
    post_count.short_description = 'Number of Posts'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """
    Admin configuration for BlogPost.
    """

    list_display = ['title', 'series', 'order', 'created_at', 'updated_at']

    # list_filter: adds a sidebar with filter options
    list_filter = ['series']

    search_fields = ['title', 'content', 'excerpt']

    readonly_fields = ['created_at', 'updated_at']

    # prepopulated_fields: automatically fills 'slug' from 'title' as you type.
    # This uses JavaScript in the admin to convert "My Post Title" → "my-post-title".
    prepopulated_fields = {'slug': ('title',)}

    # fieldsets: groups fields into sections in the edit form.
    # Format: [('Section Name', {'fields': [...]}), ...]
    # None as the section name means no header (default section).
    fieldsets = [
        (None, {
            'fields': ['series', 'title', 'slug', 'order']
        }),
        ('Content', {
            'fields': ['excerpt', 'content', 'cover_image'],
            # 'classes': ['collapse'] would make this section collapsible
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse'],  # Hidden by default, click to expand
        }),
    ]
