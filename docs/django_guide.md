# Django Guide — Learning Through This Project

This guide explains Django by walking through the actual code in this project.
Every concept is tied to a specific file you can open and read.

---

## Table of Contents

1. [What is Django?](#1-what-is-django)
2. [Project vs App](#2-project-vs-app)
3. [The Request-Response Cycle](#3-the-request-response-cycle)
4. [Models — Your Database in Python](#4-models--your-database-in-python)
5. [Migrations — Version Control for Your Database](#5-migrations--version-control-for-your-database)
6. [Django Admin — Free CMS](#6-django-admin--free-cms)
7. [Admin Inlines — Editing Related Models In Place](#7-admin-inlines--editing-related-models-in-place)
8. [Django REST Framework — Building APIs](#8-django-rest-framework--building-apis)
9. [Serializers — Python ↔ JSON](#9-serializers--python--json)
10. [ViewSets — API Endpoints Without the Boilerplate](#10-viewsets--api-endpoints-without-the-boilerplate)
11. [URL Routing](#11-url-routing)
12. [Settings — Configuring Django](#12-settings--configuring-django)
13. [The Chat App — A Plain Class-Based View](#13-the-chat-app--a-plain-class-based-view)
14. [The Multi-Provider Pattern](#14-the-multi-provider-pattern)
15. [Common Commands](#15-common-commands)

---

## 1. What is Django?

Django is a Python web framework — it handles the plumbing so you can focus on your application logic.

When a browser sends an HTTP request (e.g., `GET /api/blogs/`), Django:
1. Reads the URL and finds which view function should handle it
2. Runs that view (which can query the database, do calculations, etc.)
3. Returns an HTTP response (usually JSON for APIs, or HTML for web pages)

Django is called a "batteries included" framework because it ships with:
- An ORM (database layer) — no raw SQL needed for basic operations
- An admin panel — manage your database through a web UI
- Authentication — users, groups, permissions
- Migrations — track database schema changes over time
- A development server — no nginx setup needed locally

**FastAPI vs Django**: FastAPI (what this project used before) is great for pure APIs and is faster. Django is better when you also need an admin panel, authentication, and a rich ecosystem. For a blog CMS, Django admin saves enormous time.

---

## 2. Project vs App

Django has two levels of organization: **projects** and **apps**.

```
backend/
├── portfolio/     ← Django PROJECT (config, root URLs)
│   ├── settings.py
│   └── urls.py
├── blog/          ← Django APP (blog feature)
│   ├── models.py
│   ├── views.py
│   └── urls.py
└── chat/          ← Django APP (chat feature)
    ├── views.py
    └── urls.py
```

**Project** (`portfolio/`): The overall configuration. One project per website.
- `settings.py` — all configuration (database, installed apps, middleware, etc.)
- `urls.py` — the root URL table that delegates to apps

**App** (`blog/`, `chat/`): A self-contained feature module. One project can have many apps.
- Each app has its own models, views, and URLs
- Apps are reusable — you could copy the `blog` app into another Django project

When you create an app, you must register it in `settings.py`:
```python
# backend/portfolio/settings.py
INSTALLED_APPS = [
    ...
    'blog',   # ← your app
    'chat',   # ← your app
]
```

---

## 3. The Request-Response Cycle

Every HTTP request follows this path through Django:

```
Browser/React
     │
     ▼
Django receives request at port 8000
     │
     ▼
Middleware chain (security, CORS, sessions...)
     │
     ▼
portfolio/urls.py  ← root URL table
     │
     ├── /admin/*  → Django admin views
     ├── /api/*    → blog/urls.py → BlogSeriesViewSet / BlogPostViewSet
     └── /api/chat/ → chat/urls.py → ChatView
     │
     ▼
View runs (queries DB, calls Claude API, etc.)
     │
     ▼
Response (JSON) sent back to browser
```

Open `backend/portfolio/urls.py` — you'll see `include('blog.urls')` which is how
Django delegates URL matching to the blog app.

---

## 4. Models — Your Database in Python

**File: `backend/blog/models.py`**

A model is a Python class that maps to a database table. Each attribute is a column.

```python
class BlogPost(models.Model):
    series = models.ForeignKey(BlogSeries, on_delete=models.CASCADE, related_name='posts')
    title  = models.CharField(max_length=300)
    slug   = models.SlugField(unique=True)
    content = models.TextField()
```

This creates a table with columns: `id` (auto), `series_id`, `title`, `slug`, `content`.

### Field Types

| Field | Use case | Example |
|---|---|---|
| `CharField(max_length=n)` | Short strings | title, name |
| `TextField()` | Long strings, no limit | blog content, descriptions |
| `SlugField()` | URL-safe strings | `my-blog-post` |
| `IntegerField()` | Whole numbers | order, count |
| `BooleanField()` | True/False | is_published |
| `DateTimeField()` | Date + time | created_at |
| `ImageField()` | Uploaded raster images (validated by Pillow) | cover_image |
| `FileField()` | Any uploaded file (no content validation) | blog images including SVG |
| `ForeignKey()` | Link to another model | series (→ BlogSeries) |

### ImageField vs FileField

Both store an uploaded file in `MEDIA_ROOT` and return a URL. The key difference is validation:

- **`ImageField`** — passes the file through Pillow before saving. Pillow is a raster image library; it can read PNG, JPEG, GIF, WebP. It **cannot** read SVG (an XML vector format) and raises a `ValidationError` if you try, showing "Upload a valid image" in the admin.

- **`FileField`** — stores whatever file is uploaded with no content validation. You add your own validation rules using `validators=`.

In this project, `BlogPost.cover_image` is an `ImageField` (only raster formats make sense for a cover photo). `BlogImage.image` is a `FileField` because blog posts may contain SVG diagrams:

```python
from django.core.validators import FileExtensionValidator

image = models.FileField(
    upload_to='blog_images/',
    validators=[FileExtensionValidator(
        allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
    )],
)
```

`FileExtensionValidator` checks the filename extension. It is weaker than content validation (a user could rename `malware.exe` to `photo.jpg`), but for an admin-only CMS it is sufficient. For public upload forms, additionally check the MIME type or file magic bytes.

### auto_now_add vs auto_now

```python
created_at = models.DateTimeField(auto_now_add=True)  # Set ONCE on creation
updated_at = models.DateTimeField(auto_now=True)       # Updated on every .save()
```

### ForeignKey and Relationships

```python
class BlogPost(models.Model):
    series = models.ForeignKey(
        BlogSeries,
        on_delete=models.CASCADE,  # Delete posts if series is deleted
        related_name='posts',      # Access posts from series: series.posts.all()
    )
```

`ForeignKey` = Many-to-One. Many blog posts can belong to one series.

`on_delete` options:
- `CASCADE` — delete child when parent is deleted (most common)
- `SET_NULL` — set field to null when parent is deleted
- `PROTECT` — prevent parent deletion if children exist

### ORM Queries

```python
# Get all posts
BlogPost.objects.all()

# Filter by field
BlogPost.objects.filter(series_id=1)

# Get one (raises exception if not found)
BlogPost.objects.get(slug='my-post')

# Order results
BlogPost.objects.order_by('order', 'created_at')

# Follow relationships (avoids extra SQL queries)
BlogPost.objects.select_related('series').all()   # joins series table
BlogPost.objects.prefetch_related('posts').all()  # fetches related in one extra query
```

---

## 5. Migrations — Version Control for Your Database

Migrations track changes to your models over time, like git for your database schema.

**Workflow:**
```bash
# 1. You change models.py (add a field, create a new model, etc.)

# 2. Generate a migration file
uv run python manage.py makemigrations
# → Creates blog/migrations/0001_initial.py

# 3. Apply it to the database
uv run python manage.py migrate
# → Runs the SQL to create/alter tables
```

You should commit migration files to git — they let teammates and production servers
catch up to your schema changes by running `migrate`.

**Viewing generated SQL** (useful for learning):
```bash
uv run python manage.py sqlmigrate blog 0001
```

---

## 6. Django Admin — Free CMS

**File: `backend/blog/admin.py`**

Django ships with a built-in admin panel at `/admin/`. It provides full CRUD
(Create, Read, Update, Delete) for any model you register — for free.

### Registering a model

```python
from django.contrib import admin
from .models import BlogSeries, BlogPost

@admin.register(BlogSeries)
class BlogSeriesAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']
    search_fields = ['title']
```

`@admin.register(BlogSeries)` is a decorator — equivalent to:
```python
admin.site.register(BlogSeries, BlogSeriesAdmin)
```

### Key admin options

| Option | What it does |
|---|---|
| `list_display` | Columns shown in the list view |
| `search_fields` | Fields the search box searches |
| `list_filter` | Adds filter sidebar |
| `readonly_fields` | Show but don't allow editing |
| `prepopulated_fields` | Auto-fill field from another (e.g., slug from title) |
| `fieldsets` | Group fields into sections in the edit form |

### Creating your admin account

```bash
uv run python manage.py createsuperuser
# → prompts for username, email, password
```

Then visit `http://localhost:8000/admin/` and log in.

---

## 7. Admin Inlines — Editing Related Models In Place

**File: `backend/blog/admin.py`**

By default, to manage a `BlogImage` you would open a separate admin page at
`/admin/blog/blogimage/`. An **inline** embeds the related model's form directly
inside the parent model's edit page — in this case, the image upload form appears
at the bottom of the blog post edit page.

### Defining an inline

```python
from django.contrib import admin
from django.utils.html import format_html
from .models import BlogImage

class BlogImageInline(admin.TabularInline):
    model = BlogImage              # which model to embed
    fields = ['name', 'image', 'markdown_snippet', 'thumbnail']
    readonly_fields = ['markdown_snippet', 'thumbnail']
    extra = 1                      # how many empty rows to show by default
```

`TabularInline` = compact table layout. `StackedInline` = one tall form per row.

### Attaching an inline to the parent admin

```python
@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    inlines = [BlogImageInline]   # ← appears at bottom of post edit page
    ...
```

### Computed columns with `format_html()`

Inlines can show computed columns — values calculated at display time, not stored in the database. In `BlogImageInline`:

- **`thumbnail`** — renders a small `<img>` preview tag
- **`markdown_snippet`** — renders a copyable `<code>` element with the full image URL

```python
def thumbnail(self, obj):
    if obj.image:
        return format_html(
            '<img src="{}" style="max-height:60px;" />',
            obj.image.url   # Django builds the /media/... URL automatically
        )
    return "—"
thumbnail.short_description = "Preview"
```

**Why `format_html()` and not an f-string?**
Django admin displays columns as plain text by default — HTML tags are escaped to prevent XSS.
`format_html()` tells Django "this HTML is safe, render it as HTML". Critically, it
auto-escapes the `{}` variables, so if `obj.image.url` somehow contained a `<script>` tag,
it would be displayed as text, not executed. Always use `format_html()` when rendering
HTML in admin — never plain string concatenation.

### `obj.image.url` — how Django builds media URLs

When you access `obj.image.url`, Django combines:
- `MEDIA_URL = '/media/'` (from settings.py)
- The `upload_to` path (`'blog_images/'`)
- The actual filename

Result: `/media/blog_images/diagram.svg` → served by Django at `http://localhost:8000/media/blog_images/diagram.svg`

---

## 8. Django REST Framework — Building APIs

**File: `backend/blog/views.py`**

Django REST Framework (DRF) makes building JSON APIs easy. It handles:
- Parsing incoming JSON
- Serializing models to JSON
- Routing (via Router)
- Permissions and authentication

The core building block is a **ViewSet** — a class that groups related API actions together.

### ViewSet types

| ViewSet | Provides |
|---|---|
| `ReadOnlyModelViewSet` | GET list + GET retrieve |
| `ModelViewSet` | GET list, GET retrieve, POST create, PUT update, DELETE destroy |

Our blog uses `ReadOnlyModelViewSet` because we manage content through Django Admin, not through the public API:

```python
class BlogSeriesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogSeries.objects.prefetch_related('posts').all()
    serializer_class = BlogSeriesSerializer
    permission_classes = [permissions.AllowAny]
```

### Overriding the queryset per request

```python
def get_queryset(self):
    queryset = BlogPost.objects.all()
    series_id = self.request.query_params.get('series_id')
    if series_id:
        queryset = queryset.filter(series_id=series_id)
    return queryset
```

This enables `GET /api/blogs/?series_id=3` to filter by series.

### Using a different serializer for list vs detail

```python
def get_serializer_class(self):
    if self.action == 'retrieve':
        return BlogSeriesDetailSerializer   # includes nested posts
    return BlogSeriesSerializer             # lightweight summary only
```

`self.action` is set by DRF: `'list'`, `'retrieve'`, `'create'`, `'update'`, `'destroy'`.

---

## 9. Serializers — Python ↔ JSON

**File: `backend/blog/serializers.py`**

Serializers do two jobs:

**Serialization** (Python object → JSON dict):
```python
post = BlogPost.objects.get(slug='my-post')
serializer = BlogPostSerializer(post)
data = serializer.data   # → Python dict, ready to send as JSON
```

**Deserialization** (JSON → validated Python object):
```python
serializer = BlogPostSerializer(data=request.data)
if serializer.is_valid():
    serializer.save()   # creates/updates the database record
```

### ModelSerializer

`ModelSerializer` auto-generates fields from your model:

```python
class BlogPostSerializer(serializers.ModelSerializer):
    series_title = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'content', 'series', 'series_title', ...]
        read_only_fields = ['created_at', 'updated_at']

    def get_series_title(self, obj):
        # obj = the BlogPost instance being serialized
        return obj.series.title
```

### Nested serializers

```python
class BlogSeriesDetailSerializer(serializers.ModelSerializer):
    # Embed the list of posts inside the series JSON
    posts = BlogPostSerializer(many=True, read_only=True)

    class Meta:
        model = BlogSeries
        fields = ['id', 'title', 'posts']
```

Result:
```json
{
  "id": 1,
  "title": "Transformer Series",
  "posts": [
    {"id": 1, "title": "What is Attention?", "slug": "what-is-attention"},
    {"id": 2, "title": "Multi-Head Attention", "slug": "multi-head-attention"}
  ]
}
```

---

## 10. ViewSets — API Endpoints Without the Boilerplate

**File: `backend/blog/urls.py`**

DRF's `DefaultRouter` generates all URL patterns from a ViewSet automatically:

```python
router = DefaultRouter()
router.register('series', BlogSeriesViewSet, basename='series')
router.register('blogs', BlogPostViewSet, basename='blogs')
urlpatterns = router.urls
```

This single block creates:

| Method | URL | Action | Description |
|---|---|---|---|
| GET | `/api/series/` | `list` | All series |
| GET | `/api/series/{id}/` | `retrieve` | One series |
| GET | `/api/blogs/` | `list` | All posts |
| GET | `/api/blogs/{slug}/` | `retrieve` | One post |

Without DRF, you'd write each of these as a separate function. With ViewSets + Router, it's four lines.

---

## 11. URL Routing

**File: `backend/portfolio/urls.py`**

Django matches request URLs against `urlpatterns` in order, top to bottom:

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('blog.urls')),      # delegates to blog/urls.py
    path('api/chat/', include('chat.urls')), # delegates to chat/urls.py
]
```

`path('api/', include('blog.urls'))` means:
- Strip `'api/'` from the URL
- Pass the rest to `blog/urls.py` for further matching
- `GET /api/series/` → `blog/urls.py` receives `series/` → router matches it

### `include()` vs direct assignment

```python
# This includes all URLs from blog/urls.py under the /api/ prefix
path('api/', include('blog.urls'))

# This would only handle /admin/ itself, nothing under it
path('admin/', admin.site.urls)
```

---

## 12. Settings — Configuring Django

**File: `backend/portfolio/settings.py`**

Key settings and what they do:

```python
# Apps that Django knows about — must list your apps here
INSTALLED_APPS = ['blog', 'chat', 'rest_framework', 'corsheaders', ...]

# Middleware = chain of functions that process every request/response
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be near the top
    ...
]

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Where uploaded files are saved and served from
MEDIA_ROOT = BASE_DIR / 'media'   # filesystem path
MEDIA_URL = '/media/'             # URL prefix

# Who is allowed to call this API from a different origin (port)
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
```

### Environment variables

We use `python-dotenv` to load secrets from `backend/.env`:

```python
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-value')
```

`os.environ.get('KEY', 'default')` reads `KEY` from the environment. If not set, returns `'default'`.
This lets you use different values in dev (`.env`) and production (actual env vars).

---

## 13. The Chat App — A Plain Class-Based View

**File: `backend/chat/views.py`**

Unlike the blog app which uses DRF ViewSets, the chat endpoint uses a simple
Django `View` — because we don't need any of the DRF features (no serializer,
no router, just one POST endpoint).

```python
@method_decorator(csrf_exempt, name='dispatch')
class ChatView(View):
    def post(self, request):
        data = json.loads(request.body)
        ...
        return JsonResponse({'reply': reply})
```

**`View`** is Django's base class for class-based views. It routes HTTP methods
to methods of the same name: `GET` → `get()`, `POST` → `post()`, etc.

**`csrf_exempt`**: Django normally requires a CSRF token for POST requests to
prevent cross-site request forgery attacks. Since our React app is a separate
SPA (not a Django-rendered form), it doesn't have a CSRF token, so we disable
the check for this endpoint. In production, you'd use token-based authentication instead.

**`JsonResponse`**: Returns a Python dict as a JSON HTTP response, automatically
setting the `Content-Type: application/json` header.

---

## 14. The Multi-Provider Pattern

**File: `backend/chat/providers.py`**

This file demonstrates two important Python design patterns:

### Abstract Base Class (ABC)

```python
from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    def is_available(self) -> bool: ...

    @abstractmethod
    def chat(self, system_prompt: str, messages: list) -> str: ...
```

`ABC` enforces a contract: any class that inherits from `LLMProvider` MUST implement
`is_available()` and `chat()`. If it doesn't, Python raises a `TypeError` when you try
to instantiate it.

This means `views.py` can call `provider.chat(...)` without knowing whether
`provider` is Claude, Gemini, OpenAI, or Ollama — they all have the same interface.

### Strategy Pattern

```python
ALL_PROVIDERS = [ClaudeProvider(), GeminiProvider(), OpenAIProvider(), OllamaProvider()]

def get_available_provider():
    for provider in ALL_PROVIDERS:
        if provider.is_available():
            return provider
    raise RuntimeError("No providers available")
```

The calling code (`views.py`) doesn't care which provider runs.
To add a new provider (e.g., Cohere), you only change `providers.py` — `views.py` stays the same.

### Lazy imports

Notice that each provider imports its SDK inside the method:

```python
def chat(self, system_prompt, messages):
    import anthropic   # ← imported here, not at the top of the file
    ...
```

This is intentional: if a package isn't installed (e.g., you don't have `openai`),
the import error only happens when that provider is actually used — not on server startup.

---

## 15. Common Commands

```bash
# Always prefix with 'uv run' so Django uses the project's virtual environment

# Start the development server
uv run python manage.py runserver

# Create database tables from models
uv run python manage.py migrate

# Generate a new migration after changing models.py
uv run python manage.py makemigrations

# Open an interactive Python shell with Django loaded
uv run python manage.py shell

# Create an admin user
uv run python manage.py createsuperuser

# See what SQL a migration will run
uv run python manage.py sqlmigrate blog 0001

# Check for configuration errors
uv run python manage.py check

# Add a new Python package
uv add package-name
```

### Django shell — interactive database queries

The shell is great for experimenting with your models:

```bash
uv run python manage.py shell
```

```python
>>> from blog.models import BlogSeries, BlogPost
>>> BlogSeries.objects.all()
>>> series = BlogSeries.objects.get(id=1)
>>> series.posts.all()
>>> series.posts.count()
>>> BlogPost.objects.filter(series=series).order_by('order')
```
