# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-04 10:07
from __future__ import unicode_literals

from django.db import migrations


def calculate_max_values(apps, schema_editor):
    Option = apps.get_model('promo', 'Option')
    Category = apps.get_model('catalog', 'Category')
    Option.objects.filter(tech_name='cat_background').update(max_count=Category.objects.all().count())


class Migration(migrations.Migration):

    dependencies = [
        ('promo', '0003_auto_20160928_0848'),
    ]

    operations = [
        migrations.RunPython(calculate_max_values, migrations.RunPython.noop),
    ]
