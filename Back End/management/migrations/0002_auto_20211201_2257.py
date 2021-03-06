# Generated by Django 3.0.14 on 2021-12-01 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('management', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Dates',
            new_name='Date',
        ),
        migrations.RenameModel(
            old_name='Products',
            new_name='Product',
        ),
        migrations.AddField(
            model_name='appointment',
            name='products',
            field=models.ManyToManyField(to='management.Product'),
        ),
    ]
