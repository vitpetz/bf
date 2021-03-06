# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-31 09:54
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('banners', '0002_auto_20160824_1042'),
        ('advertisers', '0002_auto_20160829_1353'),
    ]

    operations = [
        migrations.CreateModel(
            name='Merchant',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, unique=True, verbose_name='Название')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Описание')),
                ('url', models.URLField(blank=True, null=True, verbose_name='URL')),
                ('slug', models.SlugField(blank=True, null=True, verbose_name='Слаг')),
                ('promocode', models.CharField(blank=True, max_length=100, null=True, verbose_name='Промо код')),
                ('image', models.ImageField(upload_to='merchants', verbose_name='Изображение')),
                ('moderation_comment', models.TextField(blank=True, null=True, verbose_name='Комментарий модератора')),
                ('moderation_status', models.IntegerField(choices=[(0, 'Не модерировался'), (1, 'Ожидает модерации'), (2, 'Подтверждён'), (3, 'Отклонён')], default=0, verbose_name='Статус модерации')),
                ('is_active', models.BooleanField(default=False, verbose_name='Активен')),
                ('advertiser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='merchants', to=settings.AUTH_USER_MODEL, verbose_name='Рекламодатель')),
                ('partners', models.ManyToManyField(related_name='merchants', to='banners.Partner', verbose_name='Партнеры')),
            ],
        ),
    ]
