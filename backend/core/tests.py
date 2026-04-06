from django.test import TestCase


class HealthCheckTests(TestCase):
    def test_health_check_returns_ok(self):
        response = self.client.get('/health/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                'status': 'ok',
                'database': 'ok',
            },
        )

    def test_health_check_echoes_request_id(self):
        response = self.client.get('/health/', HTTP_X_REQUEST_ID='req-health-123')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['X-Request-ID'], 'req-health-123')
