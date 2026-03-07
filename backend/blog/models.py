"""
blog/models.py — Database Models for Blog Content

──────────────────────────────────────────────────────────────────────────────
WHAT IS A MODEL?
──────────────────────────────────────────────────────────────────────────────
In Django, a "model" is a Python class that represents a database table.
Each attribute of the class = a column in that table.

Django's ORM (Object-Relational Mapper) translates Python into SQL:
  BlogSeries.objects.all()       → SELECT * FROM blog_blogseries;
  BlogSeries.objects.get(id=1)   → SELECT * FROM blog_blogseries WHERE id=1;
  series.save()                  → INSERT INTO blog_blogseries (...) VALUES (...);

After changing models, always run TWO commands:
  1. uv run python manage.py makemigrations   ← generates migration file
  2. uv run python manage.py migrate          ← applies it to the database

Migrations are Django's version control for your database schema.
──────────────────────────────────────────────────────────────────────────────
"""

from django.db import models


class BlogSeries(models.Model):
    """
    A BlogSeries groups related blog posts together.
    Example: "Transformer Series" → posts on attention, BERT, GPT, etc.

    Inheriting from models.Model is what makes this a Django model.
    It gives the class all ORM machinery: save(), delete(), objects, etc.
    """

    # CharField: fixed-length string. max_length is required.
    title = models.CharField(
        max_length=200,
        help_text="e.g. 'Transformer Architecture Series'"
    )

    # TextField: variable-length text, no size limit. Good for descriptions.
    description = models.TextField(
        help_text="A paragraph describing what this series covers."
    )

    # ImageField: stores an uploaded image.
    # upload_to='series/' → files go to MEDIA_ROOT/series/filename.jpg
    # blank=True → field is optional in forms
    # null=True  → the database column can store NULL (no value)
    cover_image = models.ImageField(
        upload_to='series/',
        blank=True,
        null=True,
        help_text="Optional cover image shown on the series card."
    )

    # auto_now_add=True: Django sets this to 'now' when the row is first created.
    # You cannot set it manually — Django always manages it.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """
        Meta is an inner class for model-level configuration.
        It doesn't create a database column — just configures behavior.
        """
        # Default ordering when you call BlogSeries.objects.all()
        # '-created_at' = newest first (the '-' prefix = descending order)
        ordering = ['-created_at']
        # Names shown in Django Admin panel
        verbose_name = 'Blog Series'
        verbose_name_plural = 'Blog Series'

    def __str__(self):
        """
        Controls how this object appears as a string.
        Django Admin uses this in dropdowns and list views.
        Without it, you'd see "BlogSeries object (1)" everywhere.
        """
        return self.title


class BlogPost(models.Model):
    """
    A single blog post belonging to a series.
    Stores content as Markdown — React renders it to HTML using marked.js.
    """

    # ForeignKey = many-to-one relationship.
    # Many BlogPosts can belong to one BlogSeries.
    #
    # on_delete=CASCADE: if the parent BlogSeries is deleted,
    # all its BlogPosts are automatically deleted too.
    # Other options: SET_NULL, PROTECT, DO_NOTHING
    #
    # related_name='posts': lets us do series.posts.all()
    # Without it, Django defaults to: series.blogpost_set.all()
    series = models.ForeignKey(
        BlogSeries,
        on_delete=models.CASCADE,
        related_name='posts',
        help_text="Which series does this post belong to?"
    )

    title = models.CharField(max_length=300)

    # SlugField: URL-safe version of the title.
    # "Attention Is All You Need" → "attention-is-all-you-need"
    # unique=True: no two posts can have the same slug (used in URLs).
    slug = models.SlugField(
        unique=True,
        max_length=300,
        help_text="URL-friendly ID. In Django Admin, click the magic wand to auto-fill from title."
    )

    # The full blog post content in Markdown format.
    content = models.TextField(
        help_text="Write in Markdown. Code blocks with ``` are syntax-highlighted in React."
    )

    # Short preview shown on blog listing cards. Optional.
    excerpt = models.TextField(
        blank=True,
        default='',
        help_text="1-2 sentence preview shown in blog listing cards."
    )

    cover_image = models.ImageField(
        upload_to='posts/',
        blank=True,
        null=True
    )

    # Controls display order within a series. Lower number = shown first.
    order = models.PositiveIntegerField(
        default=0,
        help_text="Display order within the series. 1 = first, 2 = second, etc."
    )

    # auto_now_add: set once on creation, never changed.
    created_at = models.DateTimeField(auto_now_add=True)

    # auto_now: updated to 'now' every time .save() is called.
    # Tracks "last edited" time.
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Sort by order first, then by creation date within the same order value
        ordering = ['order', 'created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'

    def __str__(self):
        return f"{self.series.title} — {self.title}"
