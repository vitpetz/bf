# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-22 09:22
from __future__ import unicode_literals

from django.db import migrations, models


def migrate_role(apps, schema_editor):
    User = apps.get_model('users', 'User')
    for user in User.objects.all():
        if user.is_admin:
            user._role = 3
        elif user.profile:
            user._role = 2
        else:
            continue
        user.save()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_auto_20160912_1116'),
    ]

    operations = [

    # ... the actual migration operations here ...

        migrations.AddField(
            model_name='user',
            name='_role',
            field=models.IntegerField(choices=[(0, 'operator'), (1, 'manager'), (2, 'advertiser'), (3, 'admin')], default=1),
        ),
        migrations.RunSQL('SET CONSTRAINTS ALL IMMEDIATE', reverse_sql=migrations.RunSQL.noop),
        migrations.RunPython(migrate_role, noop),
        migrations.RunSQL(migrations.RunSQL.noop, reverse_sql='SET CONSTRAINTS ALL IMMEDIATE'),
        migrations.RemoveField(
            model_name='user',
            name='is_admin',
        ),
    ]
