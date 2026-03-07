"""
blog/serializers.py — DRF Serializers for Blog Models

──────────────────────────────────────────────────────────────────────────────
WHAT IS A SERIALIZER?
──────────────────────────────────────────────────────────────────────────────
Serializers do two jobs:

1. SERIALIZATION (Python → JSON):
   Converts a Django model instance into a Python dict, which DRF then
   converts to a JSON response body.

     BlogSeries(id=1, title="Transformers") → {"id": 1, "title": "Transformers"}

2. DESERIALIZATION (JSON → Python):
   Validates incoming JSON data from POST/PUT requests, then converts it
   to a Python object that can be saved to the database.

ModelSerializer is a shortcut that:
  - Automatically generates fields from your model's field definitions
  - Provides default create() and update() implementations
  - Handles validation (e.g., required fields, max_length)

Think of serializers like Django forms, but for APIs.
──────────────────────────────────────────────────────────────────────────────
"""

from rest_framework import serializers
from .models import BlogSeries, BlogPost


class BlogPostSerializer(serializers.ModelSerializer):
    """
    Serializes a BlogPost to/from JSON.

    ModelSerializer inspects our BlogPost model and automatically creates
    fields for each model field we list in Meta.fields.
    """

    # SerializerMethodField lets us add computed/custom fields to the JSON output
    # that don't directly correspond to a model field.
    # The method name must be get_<field_name>.
    series_title = serializers.SerializerMethodField()

    class Meta:
        # model: which Django model this serializer is based on
        model = BlogPost

        # fields: which model fields to include in the JSON output.
        # '__all__' would include every field, but explicit lists are safer
        # (prevents accidentally exposing internal fields in the future).
        fields = [
            'id',
            'series',          # Foreign key → returns the series ID (integer)
            'series_title',    # Our custom computed field (returns series.title string)
            'title',
            'slug',
            'content',         # Full markdown content
            'excerpt',
            'cover_image',
            'order',
            'created_at',
            'updated_at',
        ]

        # read_only_fields: these are included in responses but ignored in requests.
        # The database sets them automatically (auto_now_add, auto_now).
        read_only_fields = ['created_at', 'updated_at']

    def get_series_title(self, obj):
        """
        Returns the title of the series this post belongs to.
        'obj' is the BlogPost instance being serialized.

        This avoids making a separate API call to get the series name.
        """
        return obj.series.title


class BlogSeriesSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for BlogSeries — used in list views.
    Includes a post_count but not the full list of posts (keeps response small).
    """

    # SerializerMethodField for a computed post count
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogSeries
        fields = ['id', 'title', 'description', 'cover_image', 'created_at', 'post_count']
        read_only_fields = ['created_at']

    def get_post_count(self, obj):
        """Returns how many posts are in this series."""
        return obj.posts.count()


class BlogSeriesDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for a single BlogSeries — used in retrieve views.
    Includes the nested list of posts within this series.
    """

    # Nested serializer: embed a list of serialized BlogPosts inside the series JSON.
    # many=True means it's a list (not a single object).
    # read_only=True means this field can't be set via POST body.
    posts = BlogPostSerializer(many=True, read_only=True)

    class Meta:
        model = BlogSeries
        fields = ['id', 'title', 'description', 'cover_image', 'created_at', 'posts']
        read_only_fields = ['created_at']
