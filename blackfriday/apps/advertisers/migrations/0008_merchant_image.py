# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-20 10:45
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mediafiles', '0001_initial'),
        ('advertisers', '0007_remove_merchant_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='merchant',
            name='image',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='mediafiles.Image', verbose_name='Изображение'),
        ),
    ]
