import os
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / '.env')


def get_env(name, default=None):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip()


def get_required_env(name):
    value = get_env(name)
    if not value:
        raise ImproperlyConfigured(f'{name} must be set.')
    return value


def get_bool_env(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def get_int_env(name, default=0):
    value = get_env(name)
    if value is None or value == '':
        return default

    try:
        return int(value)
    except ValueError as exc:
        raise ImproperlyConfigured(f'{name} must be an integer.') from exc


def get_list_env(name, default=None):
    if default is None:
        default = []

    value = get_env(name)
    if not value:
        return list(default)

    return [item.strip() for item in value.split(',') if item.strip()]


def strip_trailing_slash(value):
    return value.rstrip('/')


def build_database_config(require_database_url=False):
    database_url = get_env('DATABASE_URL')

    if not database_url:
        if require_database_url:
            raise ImproperlyConfigured('DATABASE_URL must be set.')

        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }

    parsed = urlparse(database_url)
    scheme = parsed.scheme.lower()

    if scheme in {'postgres', 'postgresql', 'pgsql', 'postgresql+psycopg'}:
        database_name = unquote(parsed.path.lstrip('/'))
        if not database_name:
            raise ImproperlyConfigured('DATABASE_URL must include a database name.')

        query = parse_qs(parsed.query)
        sslmode = query.get('sslmode', [None])[0]
        if not sslmode and get_bool_env('DATABASE_SSL_REQUIRE', False):
            sslmode = 'require'

        options = {}
        if sslmode:
            options['sslmode'] = sslmode

        config = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': database_name,
            'USER': unquote(parsed.username or ''),
            'PASSWORD': unquote(parsed.password or ''),
            'HOST': parsed.hostname or 'localhost',
            'PORT': str(parsed.port or 5432),
            'CONN_MAX_AGE': get_int_env('DATABASE_CONN_MAX_AGE', 60),
            'CONN_HEALTH_CHECKS': True,
        }

        if options:
            config['OPTIONS'] = options

        return config

    if scheme in {'sqlite', 'sqlite3'}:
        sqlite_path = unquote(parsed.path or '')
        if sqlite_path.startswith('/') and len(sqlite_path) > 2 and sqlite_path[2] == ':':
            sqlite_path = sqlite_path.lstrip('/')

        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': Path(sqlite_path) if sqlite_path else BASE_DIR / 'db.sqlite3',
        }

    raise ImproperlyConfigured(f'Unsupported DATABASE_URL scheme: {scheme}')


SECRET_KEY = get_env('SECRET_KEY', 'dev-only-secret-key-change-before-production')
DEBUG = False

SITE_URL = strip_trailing_slash(get_env('SITE_URL', 'http://localhost:8000'))
FRONTEND_URL = strip_trailing_slash(get_env('FRONTEND_URL', 'http://localhost:5173'))
ALLOWED_HOSTS = get_list_env('ALLOWED_HOSTS', ['localhost', '127.0.0.1'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'core',
    'blog',
    'chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'core.middleware.RequestIdMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'portfolio.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
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
ASGI_APPLICATION = 'portfolio.asgi.application'

DATABASES = {
    'default': build_database_config(),
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'portfolio-default-cache',
    },
}

default_cors_origins = [FRONTEND_URL]
if FRONTEND_URL != 'http://localhost:3000':
    default_cors_origins.append('http://localhost:3000')

CORS_ALLOWED_ORIGINS = get_list_env('CORS_ALLOWED_ORIGINS', default_cors_origins)
CSRF_TRUSTED_ORIGINS = get_list_env('CSRF_TRUSTED_ORIGINS', [FRONTEND_URL])
CORS_ALLOW_CREDENTIALS = True

CHAT_MESSAGE_MAX_LENGTH = get_int_env('CHAT_MESSAGE_MAX_LENGTH', 2000)
CHAT_HISTORY_MESSAGE_MAX_LENGTH = get_int_env('CHAT_HISTORY_MESSAGE_MAX_LENGTH', 4000)
CHAT_HISTORY_MAX_MESSAGES = get_int_env('CHAT_HISTORY_MAX_MESSAGES', 12)
CHAT_THROTTLE_RATE = get_env('CHAT_THROTTLE_RATE', '60/hour')

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'chat': CHAT_THROTTLE_RATE,
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_HTTPONLY = True

LOG_LEVEL = get_env('LOG_LEVEL', 'INFO').upper()

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'request_id': {
            '()': 'core.logging.RequestIdFilter',
        },
    },
    'formatters': {
        'json': {
            '()': 'core.logging.JsonFormatter',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'filters': ['request_id'],
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': LOG_LEVEL,
    },
}
