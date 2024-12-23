# Generated by Django 5.1.4 on 2024-12-22 15:43

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0002_file_encryption_iv_file_encryption_key_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='file',
            options={'ordering': ['-created_at']},
        ),
        migrations.AddField(
            model_name='file',
            name='added_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='files_added_by', to=settings.AUTH_USER_MODEL),
        ),
    ]
