# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-31 09:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertisers', '0002_auto_20160829_1353'),
    ]

    operations = [
        migrations.AddField(
            model_name='advertiserprofile',
            name='head_appointment',
            field=models.CharField(blank=True, max_length=250, null=True, verbose_name='Должность руковолителя'),
        ),
        migrations.AddField(
            model_name='advertiserprofile',
            name='head_basis',
            field=models.IntegerField(blank=True, choices=[(0, 'На основании устава'), (1, 'На основании доверенности')], null=True, verbose_name='На основании чего действует руководитель'),
        ),
        migrations.AddField(
            model_name='advertiserprofile',
            name='head_name',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='ФИО руководителя'),
        ),
    ]
