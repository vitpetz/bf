# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-08 07:51
from __future__ import unicode_literals

from django.db import migrations, models
import functools
import libs.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('mediafiles', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='image',
            field=models.ImageField(upload_to=functools.partial(libs.db.fields._update_filename, *(), **{'path': 'images/'})),
        ),
    ]
