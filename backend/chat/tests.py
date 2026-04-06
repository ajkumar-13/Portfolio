from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.settings import api_settings
from rest_framework.test import APIClient

from blog.models import BlogPost, BlogSeries


THROTTLE_REST_FRAMEWORK = {
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
		'chat': '2/min',
	},
}


class ChatApiTests(TestCase):
	def setUp(self):
		cache.clear()
		self.client = APIClient()
		self.url = '/api/chat/'
		self.series = BlogSeries.objects.create(
			title='System Design',
			description='Design notes',
		)
		self.post = BlogPost.objects.create(
			series=self.series,
			title='Load Balancing',
			slug='load-balancing',
			content='Load balancers distribute requests.',
			excerpt='Intro to load balancing.',
		)

	def tearDown(self):
		cache.clear()

	@patch('chat.views.generate_chat_response')
	def test_chat_returns_provider_reply(self, mock_generate_chat_response):
		mock_generate_chat_response.return_value = {
			'reply': 'Load balancers spread traffic across instances.',
			'provider': 'Test Provider',
			'message': {
				'role': 'assistant',
				'content': 'Load balancers spread traffic across instances.',
			},
		}

		response = self.client.post(
			self.url,
			{
				'blog_slug': self.post.slug,
				'message': 'What does a load balancer do?',
				'history': [],
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['provider'], 'Test Provider')

	def test_chat_rejects_blank_message(self):
		response = self.client.post(
			self.url,
			{
				'blog_slug': self.post.slug,
				'message': '   ',
				'history': [],
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['error'], 'message is required')

	def test_chat_returns_not_found_for_unknown_blog(self):
		response = self.client.post(
			self.url,
			{
				'blog_slug': 'missing-post',
				'message': 'What is this?',
				'history': [],
			},
			format='json',
		)

		self.assertEqual(response.status_code, 404)

	@override_settings(REST_FRAMEWORK=THROTTLE_REST_FRAMEWORK)
	@patch('chat.views.generate_chat_response')
	def test_chat_endpoint_is_throttled(self, mock_generate_chat_response):
		api_settings.reload()
		self.addCleanup(api_settings.reload)
		mock_generate_chat_response.return_value = {
			'reply': 'Answer',
			'provider': 'Test Provider',
			'message': {
				'role': 'assistant',
				'content': 'Answer',
			},
		}
		payload = {
			'blog_slug': self.post.slug,
			'message': 'Explain horizontal scaling.',
			'history': [],
		}

		self.assertEqual(self.client.post(self.url, payload, format='json').status_code, 200)
		self.assertEqual(self.client.post(self.url, payload, format='json').status_code, 200)

		response = self.client.post(self.url, payload, format='json')

		self.assertEqual(response.status_code, 429)

