# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-26 12:39
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0005_advertiserrequest_user_responsible'),
    ]

    operations = [
        migrations.RenameField(
            model_name='advertiserrequest',
            old_name='datetime_created',
            new_name='created_datetime',
        ),
        migrations.RenameField(
            model_name='advertiserrequest',
            old_name='datetime_updated',
            new_name='updated_datetime',
        ),
    ]