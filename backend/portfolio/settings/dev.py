from .base import *


DEBUG = True

LOGGING['root']['level'] = get_env('LOG_LEVEL', 'DEBUG').upper()
