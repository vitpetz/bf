# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-08 14:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mediafiles', '0002_auto_20161108_0751'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='image',
            field=models.ImageField(upload_to='images/'),
        ),
    ]
