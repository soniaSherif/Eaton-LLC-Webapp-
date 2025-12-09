from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db.models import JSONField
from django.contrib.auth.models import User
from decimal import Decimal
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import hashlib, secrets, string
from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta
'''
user = models.ForeignKey(User, on_delete=models.CASCADE)
'''
class Role(models.Model):
    role_name = models.TextField()

    def __str__(self):
        return self.role_name


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)


class Customer(models.Model):
    company_name = models.CharField(max_length=255, default='Unnamed Company')
    company_dba_name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=50)               # Required
    email = models.EmailField(max_length=255)                    # Required
    additional_comments = models.TextField(blank=True)           # Optional
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name
    '''def __str__(self):
        return self.name
'''

class Operator(models.Model):
    OPERATOR_TYPE_CHOICES = [
        ('ITO', 'Individual Truck Operator'),
        ('MTO', 'Multiple Truck Operator'),
    ]
    name = models.CharField(max_length=255)  # Individual name or company name
    operator_type = models.CharField(max_length=3, choices=OPERATOR_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.operator_type})"

class Truck(models.Model):
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE)
    truck_type = models.TextField()
    carrier = models.TextField()
    truck_number = models.CharField(max_length=100)
    license_plate = models.CharField(max_length=50)
    plate_expiry_date = models.DateField(null=True, blank=True)
    market = ArrayField(models.TextField(), blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.truck_number


class Driver(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE)
    name = models.TextField()
    email_address = models.TextField()
    phone_number = models.TextField()
    driver_license = models.CharField(max_length=100)
    license_issue_date = models.DateField(null=True, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    contact_info = models.TextField()
    address = models.TextField()
    truck_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    medical_card_expiry_date = models.DateField(null=True, blank=True)
    

    def __str__(self):
        return self.name


class DriverTruckAssignment(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    truck = models.ForeignKey(Truck, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.driver.name} assigned to {self.truck.truck_number}"
    


class Job(models.Model):
    project = models.CharField(max_length=255)
    prime_contractor = models.CharField(max_length=255)
    prime_contractor_project_number = models.CharField(max_length=255)
    contractor_invoice = models.CharField(max_length=255)
    new_contractor_invoice = models.CharField(max_length=255, blank=True, null=True)
    contractor_invoice_project_number = models.CharField(max_length=255)
    new_contractor_invoice_project_number = models.CharField(max_length=255, blank=True, null=True)
    prevailing_or_not = models.CharField(max_length=50)
    sap_or_sp_number = models.CharField(max_length=255, blank=True, null=True)
    report_requirement = models.TextField(blank=True, null=True)
    contract_number = models.CharField(max_length=255, blank=True, null=True)
    prevailing_wage_class_codes = JSONField(default=list, blank=True)
    project_id = models.CharField(max_length=255, blank=True, null=True)
    job_description = models.TextField()
    job_number = models.CharField(max_length=255)
    material = models.CharField(max_length=255)
    truck_types = JSONField(default=list, blank=True)
    job_date = models.DateField()
    shift_start = models.TimeField()
    loading_address = models.ForeignKey('Address', on_delete=models.CASCADE, related_name='loading_jobs')
    unloading_address = models.ForeignKey('Address', on_delete=models.CASCADE, related_name='unloading_jobs')
    is_backhaul_enabled = models.BooleanField(default=False)
    backhaul_loading_address = models.ForeignKey('Address', on_delete=models.CASCADE, related_name='backhaul_loading_jobs', blank=True, null=True)
    backhaul_unloading_address = models.ForeignKey('Address', on_delete=models.CASCADE, related_name='backhaul_unloading_jobs', blank=True, null=True)
    job_foreman_name = models.CharField(max_length=255)
    job_foreman_contact = models.CharField(max_length=255)
    additional_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    driver_truck_assignments = models.ManyToManyField(
        DriverTruckAssignment,
        through='JobDriverAssignment',
        related_name='jobs'
    )
    prime_contractor_customer = models.ForeignKey(
        'Customer',
        on_delete=models.PROTECT,
        related_name='jobs_as_prime',
        null=True, blank=True,
    )
    class Meta:
        indexes = [
            models.Index(fields=['prime_contractor_customer']),  # fast filtering
        ]
    def __str__(self):
        return f"Job {self.job_number} - {self.project}"

class JobDriverAssignment(models.Model):
    job  = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='driver_assignments'
    )
    # only drivers who are in DriverTruckAssignment can be picked
    driver_truck = models.ForeignKey(
        DriverTruckAssignment,
        on_delete=models.CASCADE,
        related_name='job_assignments'
    )
    assigned_at   = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('job', 'driver_truck')  # prevent duplicates

    def __str__(self):
        return f"{self.driver_truck.driver.name} → {self.job.job_number}"

class Address(models.Model):
    street_address = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    location_name = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.street_address}, {self.city}"
class Comment(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='comments')
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
# (Optional) Validation Logic You can add validation in DriverTruckAssignment to ensure only one active driver per truck:
# def clean(self):
#     if not self.unassigned_at:
#         conflict = DriverTruckAssignment.objects.filter(
#             truck=self.truck, unassigned_at__isnull=True
#         ).exclude(id=self.id)
#         if conflict.exists():
#             raise ValidationError("Truck is already assigned to another driver.")

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Sent', 'Sent'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
        ('Void', 'Void'),
    ]

    customer   = models.ForeignKey('Customer', on_delete=models.PROTECT, related_name='invoices')
    job        = models.ForeignKey('Job', on_delete=models.PROTECT, related_name='invoices')
    invoice_no = models.CharField(max_length=32, unique=True, editable=False)
    invoice_date = models.DateField(default=timezone.now)
    start_date = models.DateField(null=True, blank=True, help_text="Start of the invoice period (week range)")
    end_date = models.DateField(null=True, blank=True, help_text="End of the invoice period (week range)")
    status       = models.CharField(max_length=16, choices=STATUS_CHOICES, default='Draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return self.invoice_no

    def save(self, *args, **kwargs):
        if not self.invoice_no:
            prefix = timezone.now().strftime("INV-%Y-")
            last = Invoice.objects.filter(invoice_no__startswith=prefix).order_by('-id').first()
            n = int(last.invoice_no.split('-')[-1]) + 1 if last and last.invoice_no.split('-')[-1].isdigit() else 1
            self.invoice_no = f"{prefix}{n:06d}"
        super().save(*args, **kwargs)

    def recalc_totals(self):
        tot = self.lines.aggregate(models.Sum('line_total'))['line_total__sum'] or Decimal('0.00')
        if tot != self.total_amount:
            self.total_amount = tot
            super().save(update_fields=['total_amount'])


class InvoiceLine(models.Model):
    invoice     = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='lines')
    description = models.CharField(max_length=255, blank=True)
    service_date = models.DateField(null=True, blank=True)
    quantity    = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('1.00'))
    unit_price  = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    line_total  = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"{self.description} - {self.line_total}"

    def save(self, *args, **kwargs):
        self.line_total = (self.quantity or 0) * (self.unit_price or 0)
        super().save(*args, **kwargs)


@receiver(post_save, sender=InvoiceLine)
@receiver(post_delete, sender=InvoiceLine)
def _invoice_totals_sync(sender, instance, **kwargs):
    instance.invoice.recalc_totals()


class PayReport(models.Model):
    id = models.BigAutoField(primary_key=True)
    driver = models.ForeignKey('Driver', db_column='driver_id',
                               on_delete=models.PROTECT, related_name='pay_reports',
                               null=True, blank=True)

    week_start = models.DateField(db_column='week_start')
    week_end   = models.DateField(db_column='week_end')

    total_weight_or_hours = models.DecimalField(db_column='total_weight_or_hours', max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_truck_paid      = models.DecimalField(db_column='total_truck_paid',      max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_amount          = models.DecimalField(db_column='total_amount',          max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_due             = models.DecimalField(db_column='total_due',             max_digits=14, decimal_places=2, default=Decimal('0.00'))

    # PDF footer = report-level
    fuel_program     = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    fuel_pilot_or_kt = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    fuel_surcharge   = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    created_at = models.DateTimeField(db_column='created_at', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updated_at', auto_now=True)

    class Meta:
        db_table = 'myapp_payreport'
        managed = True
        constraints = [
            models.CheckConstraint(
                check=models.Q(week_end__gte=models.F('week_start')),
                name='pr_week_start_lte_end'
            ),
            models.UniqueConstraint(
                fields=('driver', 'week_start', 'week_end'),
                name='uniq_payreport_driver_week',
            ),
        ]
        indexes = [  
            models.Index(fields=['driver', 'week_start', 'week_end'], name='pr_driver_week_idx'),
        ]
    def __str__(self):
        who = getattr(self.driver, 'name', None) or self.driver_id
        return f"PR-{self.id} {who} [{self.week_start} → {self.week_end}]"

    def recalc_from_lines(self):
        agg = self.lines.aggregate(
            sum_hours=models.Sum('weight_or_hour'),
            max_rate=models.Max('truck_paid'),
            sum_total=models.Sum('total'),
        )
        D = lambda k: (agg[k] or Decimal('0.00'))

        self.total_weight_or_hours = D('sum_hours')
        self.total_truck_paid      = D('max_rate')
        self.total_amount          = D('sum_total')

        # Footer formula from your sample:
        self.total_due = (
            self.total_amount - self.fuel_program - self.fuel_pilot_or_kt + self.fuel_surcharge
        ).quantize(Decimal('0.01'))

        self.save(update_fields=[
            'total_weight_or_hours', 'total_truck_paid', 'total_amount', 'total_due', 'updated_at'
        ])


class PayReportLine(models.Model):
    id = models.BigAutoField(primary_key=True)

    date           = models.DateField(db_column='date')
    job_number     = models.CharField(db_column='job_number', max_length=255)
    truck_number   = models.CharField(db_column='truck_number', max_length=100)
    trailer_number = models.CharField(db_column='trailer_number', max_length=100)
    loaded         = models.CharField(db_column='loaded', max_length=255)
    unloaded       = models.CharField(db_column='unloaded', max_length=255)

    weight_or_hour = models.DecimalField(db_column='weight_or_hour', max_digits=12, decimal_places=2, default=Decimal('0.00'))
    truck_paid     = models.DecimalField(db_column='truck_paid',     max_digits=14, decimal_places=2, default=Decimal('0.00'))

    total           = models.DecimalField(db_column='total',           max_digits=14, decimal_places=2, default=Decimal('0.00'))
    trailer_rent    = models.DecimalField(db_column='trailer_rent',    max_digits=14, decimal_places=2, default=Decimal('0.00'))
    broker_charge   = models.DecimalField(db_column='broker_charge',   max_digits=14, decimal_places=2, default=Decimal('0.00'))
    contractor_paid = models.DecimalField(db_column='contractor_paid', max_digits=14, decimal_places=2, default=Decimal('0.00'))

    created_at = models.DateTimeField(db_column='created_at', auto_now_add=True)

    job    = models.ForeignKey('Job', on_delete=models.SET_NULL, null=True, blank=True, related_name='pay_lines')
    report = models.ForeignKey('PayReport', on_delete=models.CASCADE,  null=True, blank=True, related_name='lines')

    class Meta:
        db_table = 'myapp_payreportline'
        managed = True
        indexes = [
            models.Index(fields=['report', 'date']),
            models.Index(fields=['job_number']),
        ]

    def __str__(self):
        return f"{self.date} | {self.job_number} | ${self.contractor_paid}"

    def compute_amounts(self):
        # total = hours × rate; contractor_paid mirrors total for now
        self.total = (self.weight_or_hour or 0) * (self.truck_paid or 0)
        self.contractor_paid = self.total

    def save(self, *args, **kwargs):
        self.compute_amounts()
        super().save(*args, **kwargs)
class PasswordOTP(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="password_otps")
    code_hash = models.CharField(max_length=64, db_index=True)  # sha256 hex
    salt = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used = models.BooleanField(default=False)
    purpose = models.CharField(max_length=32, default="password_reset")

    class Meta:
        indexes = [models.Index(fields=["user", "created_at"])]

    @staticmethod
    def _hash(code: str, salt: str) -> str:
        return hashlib.sha256((salt + code).encode()).hexdigest()

    @classmethod
    def create_for_user(cls, user, ttl_minutes=10, length=6):
        code = "".join(secrets.choice(string.digits) for _ in range(length))
        salt = secrets.token_hex(4)
        otp = cls.objects.create(
            user=user,
            code_hash=cls._hash(code, salt),
            salt=salt,
            expires_at=timezone.now() + timedelta(minutes=ttl_minutes),
        )
        return otp, code  # return plaintext once to email it

    def verify(self, code: str, max_attempts=5) -> bool:
        if self.used or timezone.now() > self.expires_at or self.attempts >= max_attempts:
            return False
        self.attempts += 1
        ok = self.code_hash == self._hash(code, self.salt)
        if ok:
            self.used = True
        self.save(update_fields=["attempts", "used"])
        return ok