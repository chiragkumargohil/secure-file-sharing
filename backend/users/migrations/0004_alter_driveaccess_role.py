# Generated by Django 5.1.4 on 2024-12-22 03:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_selected_drive'),
    ]

    operations = [
        migrations.AlterField(
            model_name='driveaccess',
            name='role',
            field=models.CharField(choices=[('admin', 'Admin'), ('editor', 'Editor'), ('viewer', 'Viewer')], max_length=255),
        ),
    ]
