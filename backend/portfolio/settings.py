"""
Django settings for the portfolio project.

--------------------------------------------------------------
WHAT IS THIS FILE?
--------------------------------------------------------------
Every Django project has a settings.py file — it's the central
configuration file for your entire application. Think of it like
a config.json, but written in Python.

Django reads this file on startup to know:
  - Which database to use
  - Which apps are installed
  - How to handle security, media files, CORS, etc.

--------------------------------------------------------------
HOW IS IT LOADED?
--------------------------------------------------------------
The manage.py file sets an environment variable:
    DJANGO_SETTINGS_MODULE = 'portfolio.settings'
Django then imports this module automatically.
"""

import os
from pathlib import Path

# python-dotenv lets us read variables from a .env file into
# os.environ, so we can keep secrets (like API keys) out of code.
from dotenv import load_dotenv

# BASE_DIR is the root of the backend/ folder.
# Path(__file__) = this file (settings.py)
# .resolve()     = converts to an absolute path
# .parent        = portfolio/ directory
# .parent        = backend/ directory  ← BASE_DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the .env file located in backend/.env
# This must be called before we read any os.environ values below.
load_dotenv(BASE_DIR / '.env')


# ─── SECURITY ─────────────────────────────────────────────────────────────────

# SECRET_KEY is used by Django to sign cookies, sessions, tokens, etc.
# In production, NEVER hardcode this — read it from an environment variable.
# os.environ.get('KEY', 'fallback') reads KEY from the environment, or uses
# 'fallback' if KEY is not set (useful for local dev without a .env).
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-change-this-in-production-immediately'
)

# DEBUG=True shows detailed error pages during development.
# NEVER run with DEBUG=True in production — it leaks internal code.
# We read it from .env so we can easily toggle it per environment.
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ALLOWED_HOSTS lists which domain names Django will serve.
# In dev, localhost is fine. In production, set your actual domain.
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# ─── INSTALLED APPS ────────────────────────────────────────────────────────────
# Django uses an "app" system — each app is a self-contained module with its
# own models, views, urls, etc. You must register apps here for Django to
# find their models, migrations, templates, etc.

INSTALLED_APPS = [
    # Django's built-in apps (authentication, admin, sessions, etc.)
    'django.contrib.admin',        # The /admin/ panel
    'django.contrib.auth',         # User authentication system
    'django.contrib.contenttypes', # Tracks models across apps
    'django.contrib.sessions',     # Server-side session storage
    'django.contrib.messages',     # Flash messages (success/error alerts)
    'django.contrib.staticfiles',  # Serving CSS/JS/image static files

    # Third-party packages (installed via uv)
    'rest_framework',              # Django REST Framework — makes building APIs easy
    'corsheaders',                 # Allows the React frontend (on port 5173) to call this API

    # Our own apps
    'blog',                        # Blog series and posts
    'chat',                        # AI chat feature (Claude API)
]


# ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
# Middleware = a chain of functions that process every request/response.
# Think of it like Express middleware in Node.js.
# ORDER MATTERS: CorsMiddleware must come BEFORE CommonMiddleware.

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',          # ← CORS must be early in the chain
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ─── CORS (Cross-Origin Resource Sharing) ─────────────────────────────────────
# Browsers block JavaScript from calling APIs on a different domain/port
# unless the server explicitly allows it. This is the CORS security policy.
#
# Our React dev server runs on http://localhost:5173
# Our Django API runs on http://localhost:8000
# Without CORS config, the browser would block all React → Django API calls.

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server (React)
    "http://localhost:3000",   # Alternative React port
]

# In development, we also allow cookies to be sent cross-origin.
# This is needed if you later add authentication.
CORS_ALLOW_CREDENTIALS = True


# ─── URL CONFIGURATION ─────────────────────────────────────────────────────────
# Tells Django which file contains the URL routing rules.
ROOT_URLCONF = 'portfolio.urls'


# ─── TEMPLATES ─────────────────────────────────────────────────────────────────
# Django can render HTML templates (useful for the /admin/ panel).
# Since our frontend is React, we don't use templates for our own pages,
# but Django Admin still needs them.
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,  # Look for templates inside each app's templates/ folder
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio.wsgi.application'


# ─── DATABASE ──────────────────────────────────────────────────────────────────
# Django supports many databases: SQLite, PostgreSQL, MySQL, etc.
# SQLite is a single-file database — perfect for development.
# For production, switch to PostgreSQL by changing ENGINE and adding credentials.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # Creates backend/db.sqlite3
    }
}


# ─── DJANGO REST FRAMEWORK ─────────────────────────────────────────────────────
# DRF configuration. We set default permissions:
# - AllowAny: anyone can read (GET) our blog posts
# - IsAdminUser for writes is handled per-view, not globally
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}


# ─── MEDIA FILES ───────────────────────────────────────────────────────────────
# Media files = user-uploaded content (blog cover images, etc.)
# Static files = your own CSS/JS/images bundled with the app.
#
# MEDIA_URL  : the URL path where media files are served (e.g., /media/posts/image.jpg)
# MEDIA_ROOT : the filesystem path where Django saves uploaded files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ─── STATIC FILES ──────────────────────────────────────────────────────────────
STATIC_URL = 'static/'


# ─── AUTH PASSWORD VALIDATORS ──────────────────────────────────────────────────
# Django validates passwords when users are created via the admin panel.
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─── INTERNATIONALIZATION ──────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True  # Store datetimes as UTC in the database — best practice


# ─── DEFAULT PRIMARY KEY ───────────────────────────────────────────────────────
# Django auto-creates a primary key field for every model.
# BigAutoField uses 64-bit integers (allows ~9 quintillion rows) instead of 32-bit.
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
