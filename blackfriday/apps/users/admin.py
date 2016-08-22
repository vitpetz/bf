from django.contrib import admin
from django.contrib.auth.models import Group

from .models import User, Advertiser, Token


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass


@admin.register(Advertiser)
class AdvertiserAdmin(admin.ModelAdmin):
    pass


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    pass


admin.site.unregister(Group)
