# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-24 10:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('banners', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partner',
            name='name',
            field=models.CharField(max_length=120, unique=True, verbose_name='Название'),
        ),
    ]
