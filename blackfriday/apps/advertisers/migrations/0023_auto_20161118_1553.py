# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-18 15:53
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0022_auto_20161118_1412'),
    ]

    operations = [
        migrations.AlterField(
            model_name='merchant',
            name='url',
            field=models.TextField(blank=True, null=True, unique=True, verbose_name='URL'),
        ),
    ]
