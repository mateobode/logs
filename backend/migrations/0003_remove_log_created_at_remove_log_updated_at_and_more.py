# Generated by Django 5.1.6 on 2025-03-04 10:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_log_delete_logs'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='log',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='log',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='log',
            name='severity',
            field=models.CharField(choices=[('DEBUG', 'DEBUG'), ('INFO', 'INFO'), ('WARNING', 'WARNING'), ('ERROR', 'ERROR'), ('CRITICAL', 'CRITICAL')], max_length=10),
        ),
    ]
