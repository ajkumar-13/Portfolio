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
from django.conf import settings
from django.utils.html import format_html
from .models import BlogSeries, BlogPost, BlogImage


def build_public_media_url(path):
    if not path:
        return ''

    if path.startswith('http://') or path.startswith('https://'):
        return path

    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    return f"{site_url}{path}" if site_url else path


# ── BlogImage Inline ───────────────────────────────────────────────────────────

class BlogImageInline(admin.TabularInline):
    """
    An "inline" shows a related model's records inside the parent's edit page.

    TabularInline shows records in a compact table layout.
    (The alternative, StackedInline, shows each record as a tall form block.)

    By adding this inline to BlogPostAdmin, the image upload section
    appears at the bottom of the blog post editing page — no need to
    navigate to a separate page to manage images.

    HOW TO USE:
      - Open any blog post in admin
      - Scroll to the "Post Images" section at the bottom
      - Click "Add another Blog Image", upload a file, give it a name
      - Save the post — the image URL is now available to copy into Markdown
    """
    model = BlogImage

    # Which fields to show in each inline row
    fields = ['name', 'image', 'markdown_snippet', 'thumbnail']

    # markdown_snippet and thumbnail are computed — they can't be edited
    readonly_fields = ['markdown_snippet', 'thumbnail']

    # How many empty rows to show by default (0 = none, add manually)
    extra = 1

    def thumbnail(self, obj):
        """
        Shows a small image preview directly in the admin table.

        format_html() safely renders HTML in admin — it auto-escapes any
        variables you pass to prevent XSS attacks. Always use format_html()
        instead of plain string formatting when rendering HTML in Django.
        """
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:60px; max-width:100px; '
                'border-radius:4px; object-fit:cover;" />',
                obj.image.url  # Django gives us the relative URL e.g. /media/blog_images/x.png
            )
        return "—"
    thumbnail.short_description = "Preview"

    def markdown_snippet(self, obj):
        """
        Shows the full Markdown image syntax ready to copy-paste into post content.

        Example output:
                    ![image name](https://your-site.example/media/blog_images/diagram.png)

        The user copies this entire string and pastes it into the post's
        Markdown content field wherever they want the image to appear.
        """
        if obj.image:
            full_url = build_public_media_url(obj.image.url)
            snippet = f"![{obj.name}]({full_url})"
            # Render as a <code> element so it's easy to select and copy
            return format_html(
                '<code style="font-size:0.8rem; '
                'background:#f3f4f6; padding:3px 6px; border-radius:3px; '
                'user-select:all; cursor:pointer;" '
                'title="Click to select, then Ctrl+C to copy">{}</code>',
                snippet
            )
        return "Save first, then the URL will appear here"
    markdown_snippet.short_description = "Paste this into Markdown"


# ── BlogSeries Admin ───────────────────────────────────────────────────────────

@admin.register(BlogSeries)
class BlogSeriesAdmin(admin.ModelAdmin):
    """
    Admin configuration for BlogSeries.

    @admin.register(BlogSeries) is a decorator — it registers BlogSeriesAdmin
    as the admin class for BlogSeries. Equivalent to:
        admin.site.register(BlogSeries, BlogSeriesAdmin)
    """

    list_display = ['title', 'created_at', 'post_count']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at']

    def post_count(self, obj):
        """Custom column: number of posts in this series."""
        return obj.posts.count()
    post_count.short_description = 'Number of Posts'


# ── BlogPost Admin ─────────────────────────────────────────────────────────────

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """
    Admin configuration for BlogPost.

    The BlogImageInline below adds an "images" section at the bottom of the
    post editing page, letting you upload and manage inline images without
    leaving the post form.
    """

    # Inlines appear at the bottom of the edit form.
    # They show related model records inline with the parent form.
    inlines = [BlogImageInline]

    list_display = ['title', 'series', 'order', 'created_at', 'updated_at']
    list_filter = ['series']
    search_fields = ['title', 'content', 'excerpt']
    readonly_fields = ['created_at', 'updated_at']

    # prepopulated_fields: auto-fills 'slug' from 'title' as you type in admin.
    prepopulated_fields = {'slug': ('title',)}

    fieldsets = [
        (None, {
            'fields': ['series', 'title', 'slug', 'order']
        }),
        ('Content', {
            'fields': ['excerpt', 'content', 'cover_image'],
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse'],
        }),
    ]


# ── BlogImage Admin (standalone list view) ─────────────────────────────────────

@admin.register(BlogImage)
class BlogImageAdmin(admin.ModelAdmin):
    """
    Standalone admin for BlogImage — accessible at /admin/blog/blogimage/

    This lets you:
      - Browse all uploaded images across all posts
      - Upload images without being inside a specific post (useful for images
        you plan to reuse across multiple posts)
      - See thumbnails and copy Markdown snippets

    The inline in BlogPostAdmin is the primary way to upload post-specific images,
    but this view is useful for managing the full image library.
    """

    list_display = ['name', 'post', 'thumbnail', 'markdown_snippet', 'uploaded_at']
    list_filter = ['post']
    search_fields = ['name']
    readonly_fields = ['uploaded_at', 'thumbnail', 'markdown_snippet']

    def thumbnail(self, obj):
        """Image preview thumbnail."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:50px; max-width:80px; '
                'border-radius:4px; object-fit:cover;" />',
                obj.image.url
            )
        return "—"
    thumbnail.short_description = "Preview"

    def markdown_snippet(self, obj):
        """Ready-to-paste Markdown image syntax."""
        if obj.image:
            full_url = build_public_media_url(obj.image.url)
            snippet = f"![{obj.name}]({full_url})"
            return format_html(
                '<code style="font-size:0.8rem; background:#f3f4f6; '
                'padding:3px 6px; border-radius:3px; user-select:all; cursor:pointer;" '
                'title="Click to select all">{}</code>',
                snippet
            )
        return "—"
    markdown_snippet.short_description = "Markdown Snippet (copy this)"
