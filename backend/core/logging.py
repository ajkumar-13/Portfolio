import json
import logging
from contextvars import ContextVar
from datetime import datetime, timezone


REQUEST_ID_CONTEXT = ContextVar('request_id', default='-')

STANDARD_LOG_RECORD_KEYS = {
    'args',
    'asctime',
    'created',
    'exc_info',
    'exc_text',
    'filename',
    'funcName',
    'levelname',
    'levelno',
    'lineno',
    'module',
    'msecs',
    'message',
    'msg',
    'name',
    'pathname',
    'process',
    'processName',
    'relativeCreated',
    'stack_info',
    'thread',
    'threadName',
    'request_id',
}


def set_request_id(request_id):
    return REQUEST_ID_CONTEXT.set(request_id)


def reset_request_id(token):
    REQUEST_ID_CONTEXT.reset(token)


def get_request_id():
    return REQUEST_ID_CONTEXT.get()


class RequestIdFilter(logging.Filter):
    def filter(self, record):
        request = getattr(record, 'request', None)
        if request is not None and getattr(request, 'request_id', None):
            record.request_id = request.request_id
        else:
            record.request_id = get_request_id()
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'request_id': getattr(record, 'request_id', '-'),
        }

        extras = {
            key: value
            for key, value in record.__dict__.items()
            if key not in STANDARD_LOG_RECORD_KEYS and not key.startswith('_')
        }
        payload.update(extras)

        if record.exc_info:
            payload['exception'] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)
