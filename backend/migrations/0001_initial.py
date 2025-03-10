# Generated by Django 5.1.6 on 2025-03-04 07:01

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Logs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField()),
                ('message', models.TextField()),
                ('severity', models.CharField(choices=[('INFO', 'Info'), ('WARNING', 'Warning'), ('ERROR', 'Error'), ('CRITICAL', 'Critical')], max_length=10)),
                ('source', models.CharField(max_length=100)),
            ],
        ),
    ]
