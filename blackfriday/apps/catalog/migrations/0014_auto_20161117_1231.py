# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-17 12:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0013_auto_20161116_1312'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='product',
            name='url',
            field=models.TextField(verbose_name='Ссылка'),
        ),
    ]