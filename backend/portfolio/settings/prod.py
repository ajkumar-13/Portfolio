from django.core.exceptions import ImproperlyConfigured

from .base import *


DEBUG = False

SECRET_KEY = get_required_env('SECRET_KEY')
SITE_URL = strip_trailing_slash(get_required_env('SITE_URL'))
FRONTEND_URL = strip_trailing_slash(get_required_env('FRONTEND_URL'))
ALLOWED_HOSTS = get_list_env('ALLOWED_HOSTS')
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured('ALLOWED_HOSTS must be set for production.')

DATABASES = {
    'default': build_database_config(require_database_url=True),
}
if DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql':
    raise ImproperlyConfigured('Production settings require a PostgreSQL DATABASE_URL.')

CORS_ALLOWED_ORIGINS = get_list_env('CORS_ALLOWED_ORIGINS', [FRONTEND_URL])
CSRF_TRUSTED_ORIGINS = get_list_env('CSRF_TRUSTED_ORIGINS', [FRONTEND_URL])

CHAT_THROTTLE_RATE = get_env('CHAT_THROTTLE_RATE', '20/hour')
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['chat'] = CHAT_THROTTLE_RATE

SECURE_SSL_REDIRECT = get_bool_env('SECURE_SSL_REDIRECT', True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = get_int_env('SECURE_HSTS_SECONDS', 31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = get_bool_env('SECURE_HSTS_INCLUDE_SUBDOMAINS', True)
SECURE_HSTS_PRELOAD = get_bool_env('SECURE_HSTS_PRELOAD', True)

LOGGING['root']['level'] = get_env('LOG_LEVEL', 'INFO').upper()
