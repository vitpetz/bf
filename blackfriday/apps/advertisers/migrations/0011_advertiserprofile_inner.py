# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-07 15:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0010_banner'),
    ]

    operations = [
        migrations.AddField(
            model_name='advertiserprofile',
            name='inner',
            field=models.CharField(blank=True, choices=[('АКИТ', 'АКИТ'), ('AdmitAd', 'AdmitAd'), ('Партнеры', 'Партнеры')], max_length=10, null=True),
        ),
    ]
