from rest_framework import serializers

from ..models import Partner


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = ('id', 'name', 'url', 'image')


class PartnerTinySerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = ('id', 'name')
