# Generated by Django 5.1.4 on 2024-12-20 19:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0005_sharefile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sharefile',
            name='file',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='files.file'),
        ),
    ]
