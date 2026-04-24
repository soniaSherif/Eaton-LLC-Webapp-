from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0016_jobdriverassignment_on_site_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='driver',
            name='is_clocked_in',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='driver',
            name='last_clocked_in_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='driver',
            name='last_clocked_out_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
