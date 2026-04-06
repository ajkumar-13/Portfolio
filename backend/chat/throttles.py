from django.conf import settings
from rest_framework.throttling import SimpleRateThrottle


class ChatRateThrottle(SimpleRateThrottle):
    scope = 'chat'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }

    def get_rate(self):
        return settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'][self.scope]
