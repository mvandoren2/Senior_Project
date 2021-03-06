# Generated by Django 3.2.12 on 2022-03-30 22:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0048_activity_leadmember'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activitytype',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
        migrations.AlterField(
            model_name='member',
            name='external_member_ID',
            field=models.CharField(max_length=50, unique=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='userrole',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
