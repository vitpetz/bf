# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-16 12:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0020_banner_was_mailed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='banner',
            name='categories',
            field=models.ManyToManyField(blank=True, related_name='banners', to='catalog.Category'),
        ),
    ]
