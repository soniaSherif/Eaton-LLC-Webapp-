from django.db import migrations

SQL_ADD_INVOICE_DATES = """
ALTER TABLE IF EXISTS myapp_invoice
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date;
"""

# Unique constraint for PayReport (driver, week_start, week_end)
SQL_ADD_UNIQ_PAYREPORT = """
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'myapp_payreport'
      AND c.conname = 'uniq_payreport_driver_week'
  ) THEN
    ALTER TABLE myapp_payreport
      ADD CONSTRAINT uniq_payreport_driver_week
      UNIQUE (driver_id, week_start, week_end);
  END IF;
END $$;
"""

# Index on PasswordOTP (user, created_at)
SQL_ADD_PASSWORDOTP_INDEX = """
CREATE INDEX IF NOT EXISTS myapp_passw_user_id_b46287_idx
  ON myapp_passwordotp (user_id, created_at);
"""

class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0009_passwordotp_invoice_end_date_invoice_start_date_and_more'),
    ]

    operations = [
        migrations.RunSQL(SQL_ADD_INVOICE_DATES),
        migrations.RunSQL(SQL_ADD_UNIQ_PAYREPORT),
        migrations.RunSQL(SQL_ADD_PASSWORDOTP_INDEX),
    ]
