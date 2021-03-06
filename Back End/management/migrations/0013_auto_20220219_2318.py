# Generated by Django 3.0.14 on 2022-02-19 23:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0012_auto_20220219_2317'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activity',
            name='dateSelected',
        ),
        migrations.RemoveField(
            model_name='activity',
            name='threeDate',
        ),
        migrations.RemoveField(
            model_name='activity',
            name='threeTime',
        ),
        migrations.RemoveField(
            model_name='activity',
            name='timeSelected',
        ),
        migrations.RemoveField(
            model_name='activity',
            name='twoDate',
        ),
        migrations.RemoveField(
            model_name='activity',
            name='twoTime',
        ),
        migrations.AddField(
            model_name='activity',
            name='selectedDateTime',
            field=models.DateTimeField(blank=True, help_text='Year-Month-Day Hour:Minute:Second', null=True),
        ),
        migrations.AddField(
            model_name='activity',
            name='threeDateTime',
            field=models.DateTimeField(blank=True, help_text='Year-Month-Day Hour:Minute:Second', null=True),
        ),
        migrations.AddField(
            model_name='activity',
            name='twoDateTime',
            field=models.DateTimeField(blank=True, help_text='Year-Month-Day Hour:Minute:Second', null=True),
        ),
    ]
