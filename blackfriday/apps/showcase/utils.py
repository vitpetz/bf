import json
import operator

from functools import reduce
from django.template.loader import render_to_string
from django.db.models import *
from django.apps import apps
from django.conf import settings

from rest_framework import serializers

from apps.banners.models import Partner
from apps.advertisers.models import Merchant, Banner
from apps.catalog.models import Product, Category


def serializer_factory(cls_name, fields, **extra_fields):
    return type(
        '{}ContextSerializer'.format(cls_name.split('.')[1]),
        (serializers.ModelSerializer, ),
        dict(
            **extra_fields,
            **{'Meta': type('Meta', (), {'model': apps.get_model(cls_name), 'fields': fields})}
        )
    )


MerchantSerializer = serializer_factory(
    cls_name='advertisers.Merchant',
    fields=('id', 'name', 'url', 'image'),
    image=serializers.CharField(source='image.image')
)
PartnerSerializer = serializer_factory(
    cls_name='banners.Partner',
    fields=('id', 'name', 'url', 'image'),
    image=serializers.CharField(source='image.url')
)
BannerSerializer = serializer_factory(
    cls_name='advertisers.Banner',
    fields=('id', 'url', 'merchant', 'image'),
    image=serializers.CharField(source='image.image'),
    merchant=MerchantSerializer(),

)
ProductSerializer = serializer_factory(
    cls_name='catalog.Product',
    fields=('id', 'category', 'name', 'price', 'old_price', 'start_price', 'discount', 'merchant', 'url', 'image'),
    merchant=MerchantSerializer(),
)
CategorySerializer = serializer_factory(
    cls_name='catalog.Category',
    fields=('id', 'name', 'url'),
    url=serializers.SerializerMethodField(),
    get_url=lambda self, obj: '/category/{}'.format(obj.slug),
)
SuperbannerSerializer = serializer_factory(
    cls_name='advertisers.Banner',
    fields=('id', 'image', 'url'),
    image=serializers.CharField(source='image.image'),
)


def get_backgrounds(**kwargs):
    background_qs = Merchant.objects.filter(**kwargs).moderated().annotate(
        left=Max(Case(When(banners__type=30, then=F('banners__image__image')), output_field=CharField())),
        right=Max(Case(When(banners__type=40, then=F('banners__image__image')), output_field=CharField()))
    ).values(
        'left', 'right', 'banners__url', 'id'
    ).filter(Q(right__isnull=False) | Q(left__isnull=False))
    backgrounds = {}
    for b in background_qs:
        b_id = b['id']
        if b_id not in backgrounds:
            backgrounds[b_id] = {}
        if b['left']:
            backgrounds[b_id]['left'] = b['left']
        if b['right']:
            backgrounds[b_id]['right'] = b['right']
        backgrounds[b_id]['id'] = b_id
        backgrounds[b_id]['url'] = b['banners__url']
    return [value for _, value in backgrounds.items()]


def russiangoods():
    qs = Product.objects.from_moderated_merchants().filter(
        reduce(
            operator.__or__,
            [Q(name__icontains=key) for key in settings.RUSSIAN_PRODUCTS_KEYWORDS]
        )
    )
    return render_to_string(
        'showcase/russiangoods.html',
        {
            'products': json.dumps(ProductSerializer(qs, many=True).data),
            'teasers': json.dumps(ProductSerializer(qs.teasers(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )


def category(category_id):
    return render_to_string(
        'showcase/category.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(
                        in_mailing=False, categories__id=category_id),
                    many=True
                ).data
            ),
            'merchants': json.dumps(
                MerchantSerializer(
                    Merchant.objects.moderated().filter(logo_categories__id=category_id),
                    many=True
                ).data
            ),
            'banners': json.dumps(
                BannerSerializer(
                    Banner.objects.action().from_moderated_merchants().filter(categories__id=category_id),
                    many=True
                ).data
            ),
            'products': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().filter(category__id=category_id),
                    many=True
                ).data
            ),
            'backgrounds': json.dumps(get_backgrounds(categories__id=category_id)),
            'teasers': json.dumps(
                ProductSerializer(
                    Product.objects.from_moderated_merchants().teasers(),
                    many=True
                ).data
            ),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )


def merchants():
    return render_to_string(
        'showcase/merchants.html',
        {
            'merchants': json.dumps(MerchantSerializer(Merchant.objects.moderated(), many=True).data),
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(in_mailing=False),
                    many=True
                ).data
            ),
            'teasers': json.dumps(
                ProductSerializer(Product.objects.teasers().from_moderated_merchants(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )


def actions():
    return render_to_string(
        'showcase/actions.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(in_mailing=False),
                    many=True
                ).data
            ),
            'banners': json.dumps(
                BannerSerializer(Banner.objects.action().from_moderated_merchants(), many=True).data),
            'products': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'teasers': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)

        }
    )


def main_page():
    return render_to_string(
        'showcase/main.html',
        {
            'superbanners': json.dumps(
                SuperbannerSerializer(
                    Banner.objects.super().from_moderated_merchants().filter(on_main=True),
                    many=True
                ).data
            ),
            'merchants': json.dumps(MerchantSerializer(Merchant.objects.moderated(), many=True).data),
            'partners': json.dumps(PartnerSerializer(Partner.objects.all(), many=True).data),
            'banners': json.dumps(BannerSerializer(Banner.objects.from_moderated_merchants(), many=True).data),
            'verticalbanners': json.dumps(
                BannerSerializer(Banner.objects.from_moderated_merchants().vertical(), many=True).data),
            'products': json.dumps(ProductSerializer(Product.objects.from_moderated_merchants(), many=True).data),
            'backgrounds': get_backgrounds(),
            'teasersOnMain': json.dumps(
                ProductSerializer(Product.objects.from_moderated_merchants().teasers_on_main(), many=True).data),
            'categories': json.dumps(CategorySerializer(Category.objects.all(), many=True).data)
        }
    )
