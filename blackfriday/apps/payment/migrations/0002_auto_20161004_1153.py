# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-04 11:53
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='external_id',
            field=models.IntegerField(null=True),
        ),
    ]
