# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-08 14:07
from __future__ import unicode_literals

import apps.specials.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('specials', '0003_auto_20161108_0751'),
    ]

    operations = [
        migrations.AlterField(
            model_name='special',
            name='document',
            field=models.FileField(upload_to='specials', validators=[apps.specials.models.validate_file_extension]),
        ),
    ]
