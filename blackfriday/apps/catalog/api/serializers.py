from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from apps.advertisers.api.serializers import MerchantTinySerializer
from apps.advertisers.models import Merchant

from libs.api.exceptions import BadRequest

from ..models import Category, Product


class CategoryDetailSerializer(serializers.ModelSerializer):
    merchant = MerchantTinySerializer()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'merchant')


class CategorySerializer(serializers.ModelSerializer):
    merchant = serializers.PrimaryKeyRelatedField(queryset=Merchant.objects.all(), allow_null=True)

    class Meta(CategoryDetailSerializer.Meta):
        pass

    def validate(self, attrs):
        if attrs.get('merchant'):
            cat, name = self.instance, attrs.get('name')
            if name == 'Разное' or cat and cat.name == 'Разное':
                raise PermissionDenied
            if cat and (cat.banners.exists() or cat.merchant_logos.exists() or cat.products.exists()):
                raise BadRequest('Категория содержит рекламные материалы')
        return attrs


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    image = serializers.URLField(source='image.url')

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'name', 'price', 'old_price', 'start_price', 'discount',
            'country', 'is_teaser', 'is_teaser_on_main', 'brand', 'url', 'created_datetime', 'image'
        )
