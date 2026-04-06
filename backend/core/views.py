from django.db import connections
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health_check(request):
    database_status = 'ok'
    status_code = 200

    try:
        with connections['default'].cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except Exception:
        database_status = 'unavailable'
        status_code = 503

    return JsonResponse(
        {
            'status': 'ok' if status_code == 200 else 'degraded',
            'database': database_status,
        },
        status=status_code,
    )
