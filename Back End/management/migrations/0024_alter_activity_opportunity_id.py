# Generated by Django 3.2.12 on 2022-03-13 19:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0023_delete_statushistory'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activity',
            name='opportunity_ID',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
