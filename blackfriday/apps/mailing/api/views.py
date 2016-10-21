from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response

from libs.api.permissions import IsAuthenticated, IsAdmin

from apps.landing.models import LandingLogo

from .serializers import LogoMailingSerializer


class MailingViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        return LogoMailingSerializer

    @list_route(methods=['get'], renderer_classes=[TemplateHTMLRenderer])
    def banners(self, request, *args, **kwargs):
        return Response({}, template_name='mailing/api/mailing.html')

    @list_route(methods=['get', 'post'], renderer_classes=[TemplateHTMLRenderer])
    def logos(self, request, *args, **kwargs):
        data = {
            'logos': LandingLogo.objects.all()
        }
        if request.method == 'POST':
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.data
        return Response(data, template_name='mailing/api/mailing.html')