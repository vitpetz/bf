import pytest
import json

from unittest.mock import patch, PropertyMock
from django.core.urlresolvers import reverse
from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.advertisers.tests.fixtures import *
from libs.testing.helpers import lists_of_dicts_equalled

from apps.catalog.api.views import ProductViewSet
from apps.catalog.models import Product


pytestmark = pytest.mark.django_db

FAIL_SAMPLE = {
    'input': {
        "_id": 23,
        "category": "incorrect_category_name",
        "name": "name",
        "image": "image.com",
        "price": 101,
        "start_price": 'foo',
        "old_price": 100,
        "discount": 20,
        "country": "Country",
        "brand": "Brand",
        "url": "http://product_url",
        "currency": "bar"
    },
    'output': {
        'data': {
            "_id": 23,
            "category": settings.DEFAULT_CATEGORY_NAME,
            "name": "name",
            "image": "image.com",
            "price": 101,
            "start_price": 'foo',
            "old_price": 100,
            "discount": 20,
            "country": "country",
            "brand": "Brand",
            "url": "http://product_url",
            "currency": "rur"
        },
        'warnings': [
            {'field': 'price', 'message': 'Старая цена должна быть больше новой'},
            {'field': 'old_price', 'message': 'Старая цена должна быть больше новой'},
            {'field': 'url', 'message': 'Отсутствуют utm метки'}
        ],
        'errors': [
            {'field': 'start_price', 'message': 'Отсутствует числовое значение'},
            {'field': 'image', 'message': "Строка должна содержать ('http://', 'https://')"},
            {'field': 'url', 'message': 'Не является валидным url'}
        ]

    }
}


SUCCESS_SAMPLE = {
    "_id": 23,
    "category": "correct_category_name",
    "name": "name",
    "image": "http://image.com",
    "price": 100,
    "start_price": 100,
    "old_price": 101,
    "discount": 20,
    "country": "Country",
    "brand": "Brand",
    "url": "http://product-url.com/?utm_source=1&utm_medium=2&utm_campaign=3",
    "currency": "rur"
}


def test_validate_schema():
    with pytest.raises(ValidationError):
        ProductViewSet().validate_schema([[]])


def test_post_given_invalid_data_expect_400(admin_logged_client, merchant, fake_image_response):
    with patch('requests.head', return_value=fake_image_response):
        response = admin_logged_client.post(
            reverse('api:catalog:products-list', args=(merchant.id,)),
            data=json.dumps([FAIL_SAMPLE['input']]), content_type='application/json')
        assert response.status_code == 400
        assert lists_of_dicts_equalled(response.data[0]['warnings'], FAIL_SAMPLE['output']['warnings'])
        assert lists_of_dicts_equalled(response.data[0]['errors'], FAIL_SAMPLE['output']['errors'])
        assert frozenset(response.data[0]['data'].items()) == frozenset(FAIL_SAMPLE['output']['data'].items())


def test_post_given_valid_list_expect_201_product_created(
        admin_logged_client, merchant, default_category, fake_image_response):
    with patch('requests.head', return_value=fake_image_response):
        with patch('apps.advertisers.models.Merchant.limits', new_callable=PropertyMock) as fake_limits:
            fake_limits.return_value = {'products': 2}
            response = admin_logged_client.post(
                reverse('api:catalog:products-list', args=(merchant.id,)),
                data=json.dumps([SUCCESS_SAMPLE]), content_type='application/json')
            assert response.status_code == 201
            assert Product.objects.filter(name=SUCCESS_SAMPLE['name'], category=default_category).exists()


def test_post_given_valid_list_expect_400_out_of_limit(
        admin_logged_client, merchant, default_category, fake_image_response):
    with patch('requests.head', return_value=fake_image_response):
        with patch('apps.advertisers.models.Merchant.limits', new_callable=PropertyMock) as fake_limits:
            fake_limits.return_value = {'products': 0}
            response = admin_logged_client.post(
                reverse('api:catalog:products-list', args=(merchant.id,)),
                data=json.dumps([SUCCESS_SAMPLE]), content_type='application/json')
            assert response.status_code == 400
            assert response.data['detail'] == 'out_of_limit'
            assert not Product.objects.filter(name=SUCCESS_SAMPLE['name'], category=default_category).exists()


def test_put_given_invalid_data_expect_400(
        admin_logged_client, merchant, product_with_default_cat, fake_image_response):

    with patch('requests.head', return_value=fake_image_response):
        response = admin_logged_client.put(
            reverse('api:catalog:products-detail', args=(merchant.id, product_with_default_cat.id)),
            data=json.dumps(FAIL_SAMPLE['input']), content_type='application/json')
        assert response.status_code == 400
        assert lists_of_dicts_equalled(response.data['warnings'], FAIL_SAMPLE['output']['warnings'])
        assert lists_of_dicts_equalled(response.data['errors'], FAIL_SAMPLE['output']['errors'])
        assert frozenset(response.data['data'].items()) == frozenset(FAIL_SAMPLE['output']['data'].items())


def test_put_given_valid_data_expect_200_product_changed(
        admin_logged_client, merchant, product_with_default_cat, fake_image_response):
    with patch('requests.head', return_value=fake_image_response):
        response = admin_logged_client.put(
            reverse('api:catalog:products-detail', args=(merchant.id, product_with_default_cat.id)),
            data=json.dumps(SUCCESS_SAMPLE), content_type='application/json')
        assert response.status_code == 200
        assert Product.objects.get(id=product_with_default_cat.id).name == SUCCESS_SAMPLE['name']
