# Generated by Django 3.2.12 on 2022-03-23 19:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0033_auto_20220322_2257'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='account_ID',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]