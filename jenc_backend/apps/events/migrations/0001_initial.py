# PROD NOTE: The ALTER TABLE ADD CONSTRAINT UNIQUE on qr_token takes an
# ACCESS EXCLUSIVE lock. On this table (189 rows at the time of writing) it
# completes in milliseconds. If event_registration grows to >100k rows in
# production, do NOT copy this pattern — use:
#   CREATE UNIQUE INDEX CONCURRENTLY event_registration_qr_token_unique
#       ON event_registration (qr_token);
# followed by ALTER TABLE ... ADD CONSTRAINT ... USING INDEX.

from django.db import migrations


def add_view_event_registrations_permission(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Permission = apps.get_model('auth', 'Permission')
    try:
        content_type = ContentType.objects.get(app_label='core', model='eventregistration')
    except ContentType.DoesNotExist:
        content_type = ContentType.objects.create(app_label='core', model='eventregistration')

    Permission.objects.get_or_create(
        codename='view_event_registrations',
        content_type=content_type,
        defaults={'name': 'Can view event registrations'}
    )


def remove_view_event_registrations_permission(apps, schema_editor):
    Permission = apps.get_model('auth', 'Permission')
    Permission.objects.filter(codename='view_event_registrations').delete()


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0002_institutionsetting'),
        ('contenttypes', '__latest__'),
        ('auth', '__latest__'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'event_registration_qr_token_unique'
                    ) THEN
                        ALTER TABLE event_registration ADD CONSTRAINT event_registration_qr_token_unique UNIQUE (qr_token);
                    END IF;
                END $$;
            """,
            reverse_sql="""
                ALTER TABLE event_registration DROP CONSTRAINT IF EXISTS event_registration_qr_token_unique;
            """
        ),
        migrations.RunPython(
            add_view_event_registrations_permission,
            remove_view_event_registrations_permission,
        ),
    ]
