# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-09-08 12:55
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='invoice',
            options={'verbose_name': 'Счёт', 'verbose_name_plural': 'Счета'},
        ),
        migrations.AlterModelOptions(
            name='invoiceoption',
            options={'verbose_name': 'Опция в счёте', 'verbose_name_plural': 'Опции в счёте'},
        ),
    ]
