# Generated by Django 3.0.14 on 2021-12-01 23:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0007_auto_20211201_2310'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appointment',
            name='account_ID',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='appointment',
            name='opportunity_ID',
            field=models.CharField(max_length=100),
        ),
    ]
