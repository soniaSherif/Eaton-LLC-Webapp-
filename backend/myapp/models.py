from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db.models import JSONField
from django.contrib.auth.models import User


user = models.ForeignKey(User, on_delete=models.CASCADE)

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
    def __str__(self):
        return self.name


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
    contact_info = models.TextField()
    address = models.TextField()
    truck_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

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

    def __str__(self):
        return f"Job {self.job_number} - {self.project}"

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