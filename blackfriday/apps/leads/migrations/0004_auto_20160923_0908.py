# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-23 09:08
from __future__ import unicode_literals

from django.db import migrations, models


def forwards(apps, schema_editor):
    AdvertiserRequest = apps.get_model('leads', 'AdvertiserRequest')
    AdvertiserRequest.objects.filter(status=1).update(status=20)
    AdvertiserRequest.objects.filter(status=2).update(status=30)


def backwards(apps, schema_editor):
    AdvertiserRequest = apps.get_model('leads', 'AdvertiserRequest')
    AdvertiserRequest.objects.filter(status=20).update(status=1)
    AdvertiserRequest.objects.filter(status=30).update(status=2)
    AdvertiserRequest.objects.filter(status=10).update(status=0)


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0003_auto_20160907_1250'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advertiserrequest',
            name='status',
            field=models.IntegerField(choices=[(0, 'Новая'), (10, 'В работе'), (20, 'Участвует'), (30, 'Отказ')], default=0, verbose_name='Статус'),
        ),
        migrations.RunPython(forwards, reverse_code=backwards),
    ]