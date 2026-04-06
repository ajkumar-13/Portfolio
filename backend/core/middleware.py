import logging
import time
import uuid

from .logging import reset_request_id, set_request_id


logger = logging.getLogger(__name__)


class RequestIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.META.get('HTTP_X_REQUEST_ID') or uuid.uuid4().hex
        token = set_request_id(request_id)
        request.request_id = request_id

        started_at = time.perf_counter()

        try:
            response = self.get_response(request)
        except Exception:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.exception(
                'request_failed',
                extra={
                    'method': request.method,
                    'path': request.path,
                    'duration_ms': duration_ms,
                },
            )
            reset_request_id(token)
            raise

        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        response['X-Request-ID'] = request_id
        logger.info(
            'request_completed',
            extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': duration_ms,
            },
        )
        reset_request_id(token)
        return response
