# Generated by Django 3.0.14 on 2021-12-01 23:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0006_delete_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='oneDate',
            field=models.DateField(blank=True, help_text='Year-Month-Day', null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='oneTime',
            field=models.TimeField(blank=True, help_text='Hour:Minute:Second', null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='threeDate',
            field=models.DateField(blank=True, help_text='Year-Month-Day', null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='threeTime',
            field=models.TimeField(blank=True, help_text='Hour:Minute:Second', null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='twoDate',
            field=models.DateField(blank=True, help_text='Year-Month-Day', null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='twoTime',
            field=models.TimeField(blank=True, help_text='Hour:Minute:Second', null=True),
        ),
    ]
