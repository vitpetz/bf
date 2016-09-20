from rest_framework import viewsets
from rest_framework import mixins
from libs.api.permissions import IsAuthenticated

from .serializers import ImageSerializer
from ..models import Image


class ImageViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]
