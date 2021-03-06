from django.conf import settings
from django.conf.urls import url
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views

from .views import UserListView, VerificationView, RedirectByRoleView, login_no_csrf

urlpatterns = [
    url(r'^$', RedirectByRoleView.as_view()),

    url(r'^verification/$', VerificationView.as_view(), name='verification'),

    url(r'^login/$', auth_views.login, {'template_name': 'users/login.html', 'redirect_authenticated_user': True}),
    url(
        r'^landing-login/$',
        login_no_csrf,
        {'template_name': 'users/login.html', 'redirect_authenticated_user': True}
    ),
    url(r'^logout/$', auth_views.logout_then_login, name='logout'),

    url(r'^users/$', UserListView.as_view(), name='user-list'),
]
if settings.REGISTRATION_IS_AVAILABLE:
    urlpatterns += [url(r'^registration/$', TemplateView.as_view(template_name='users/registration.html'))]
