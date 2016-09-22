# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-22 09:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_auto_20160912_1116'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='is_admin',
        ),
        migrations.AddField(
            model_name='user',
            name='_role',
            field=models.IntegerField(choices=[(0, 'operator'), (1, 'manager'), (2, 'advertiser'), (3, 'admin')], default=1),
        ),
    ]
