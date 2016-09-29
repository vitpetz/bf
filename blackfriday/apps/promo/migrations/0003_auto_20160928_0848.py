# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-28 08:48
from __future__ import unicode_literals

from itertools import chain

from functools import partial

from django.db import migrations


options_header = ('id', 'name', 'tech_name', 'price', 'image', 'max_count', 'is_required', 'is_boolean')
options = [
    (1, 'Размещение логотипа на главной', 'logo_on_main', 0, 'images/options/logo_on_main.jpg', None, True, True),
    (2, 'Супербаннер на главной', 'superbanner_on_main', 0, 'images/options/superbanner_on_main.jpg', None, True, True),
    (3, 'Товар-тизер сквозной (ротация)', 'teaser', 0, 'images/options/teaser.jpg', None, True, False),
    (4, 'Супербаннер в категории (ротация)', 'superbanner_at_cat', 0, 'images/options/superbanner_at_cat.jpg', None, True, False),
    (5, 'Баннер акции на главной', 'banner_on_main', 0, 'images/options/banner_on_main.jpg', None, True, True),
    (6, 'Размещение логотипа в категории', 'logo_at_cat', 0, 'images/options/logo_at_cat.jpg', None, True, True),
    (7, 'Участие в сборной рассылке (до)', 'mailing', 0, 'images/options/mailing.jpg', None, True, False),
    (8, 'Количество уникальных категорий размещения', 'cats_num', 0, 'images/options/cats_num.jpg', None, True, False),
    (9, 'Баннер акции в категории', 'banner_at_cat', 0, 'images/options/banner_at_cat.jpg', None, True, False),
    (10, 'Товарная витрина', 'products', 0, 'images/options/goods.jpg', None, True, True),
    (11, 'Доп.баннер в 1 категорию, 1 шт.', 'additional_banner_at_cat', 20000, 'images/options/additional_banner_at_cat.jpg', None, False, False),
    (12, 'Брендирование фона главной страницы, 1 шт. (Только Gold и FridayVIP)', 'main_background', 0, 'images/options/main_background.jpg', 1, False, False),
    (13, '1 дополнительная категория размещения логотипа, 1 шт.', 'additional_logo_cat', 20000, 'images/options/additional_logo_cat.jpg', None, False, False),
    (14, 'Баннер 240*400 на главной, 1 шт.', 'vertical_banner_on_main', 0, 'images/options/vertical_banner_on_main.jpg', 3, False, False),
    (15, 'Дополнительные 100 товаров к пакету, 1 шт. (Только Gold и FridayVIP)', 'additional_goods', 50000, 'images/options/additional_goods.jpg', None, False, False),
    (16, 'Брендирование фона 1 категории, 1 шт. (Только Silver, Gold и FridayVIP)', 'cat_background', 0, 'images/options/cat_background.jpg', 10, False, False),
    (17, 'Супербаннер в 1 категории, 1 шт.', 'additional_superbanner_at_cat', 50000, 'images/options/additional_superbanner_at_cat.jpg', None, False, False),
    (18, 'Товар-тизер на главной, 1 экран (20 в ротации), 1 шт. (Только Gold и FridayVIP)', 'teaser_on_main', 15000, 'images/options/teaser_on_main.jpg', None, False, False),
    (19, 'Супербаннер в 1 рассылке, 1 шт.', 'superbanner_at_mailing', 50000, 'images/options/superbanner_at_mailing.jpg', None, False, False),
    (20, 'Товар-тизер на главной и сквозной по категориям, 1 шт. (Только Gold и FridayVIP)', 'additional_teaser', 5000, 'images/options/additional_teaser.jpg', None, False, False)
]

promos_header = ('id', 'name', 'price')
promos = [
    (1, 'Bronze', 30000),
    (2, 'Silver', 60000),
    (3, 'Gold', 100000),
    (4, 'FridayVIP', 200000),
]

promo_options = [
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 2, 1, 2, 25],
    [1, 0, 1, 1, 1, 1, 3, 2, 4, 150],
    [1, 1, 2, 2, 1, 1, 4, 4, 8, 250]
]

available_options = [
    [11, 13, 14, 17, 19],
    [11, 13, 14, 16, 17, 19],
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
]


def migrate_options(apps, schema_editor):
    Option = apps.get_model('promo', 'Option')
    Option.objects.bulk_create(Option(**dict(option)) for option in map(partial(zip, options_header), options))


def migrate_promos(apps, schema_editor):
    Promo = apps.get_model('promo', 'Promo')
    Promo.objects.bulk_create(Promo(**dict(promo)) for promo in map(partial(zip, promos_header), promos))


def migrate_promo_options(apps, schema_editor):
    objects = []

    PromoOption = apps.get_model('promo', 'PromoOption')
    for promo, promo_option in enumerate(promo_options, start=1):
        for option, value in enumerate(promo_option, start=1):
            objects.append(PromoOption(promo_id=promo, option_id=option, value=value))

    PromoOption.objects.bulk_create(objects)


def migrate_available_options(apps, schema_editor):
    objects = []

    AvailableOption = apps.get_model('promo', 'Promo').available_options.through
    for promo, options in enumerate(available_options, start=1):
        for option in options:
            objects.append(AvailableOption(promo_id=promo, option_id=option))

    AvailableOption.objects.bulk_create(objects)


def delete_all(apps, schema_editor):
    Option = apps.get_model('promo', 'Option')
    Promo = apps.get_model('promo', 'Promo')
    Invoice = apps.get_model('orders', 'Invoice')

    Option.objects.all().delete()
    Promo.objects.all().delete()
    Invoice.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('promo', '0002_promo_available_options'),
    ]

    operations = [
        migrations.RunPython(delete_all, delete_all),
        migrations.RunPython(migrate_options, migrations.RunPython.noop),
        migrations.RunPython(migrate_promos, migrations.RunPython.noop),
        migrations.RunPython(migrate_promo_options, migrations.RunPython.noop),
        migrations.RunPython(migrate_available_options, migrations.RunPython.noop),
    ]
