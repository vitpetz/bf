from django.conf.urls import include, url

urlpatterns = [
    url('^', include('apps.users.api.urls', namespace='users'))
]
