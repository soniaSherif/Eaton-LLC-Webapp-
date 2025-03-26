from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.postgres.fields import ArrayField
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


class Truck(models.Model):
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
    name = models.TextField()
    email_address = models.TextField()
    phone_number = models.TextField()
    driver_license = models.CharField(max_length=100)
    contact_info = models.TextField()
    address = models.TextField()
    operator_type = models.CharField(max_length=10)  # 'MTO' or 'ITO'
    truck_count = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DriverTruckAssignment(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    truck = models.ForeignKey(Truck, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(null=True, blank=True)


class Job(models.Model):
    job_title = models.CharField(max_length=255)
    project_title = models.CharField(max_length=255)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    job_number = models.IntegerField()
    order_number = models.IntegerField()
    material = models.CharField(max_length=255)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    truck = models.ForeignKey(Truck, on_delete=models.CASCADE)
    rate_type = models.CharField(max_length=50)
    rate = models.IntegerField()
    haul_rate_type = models.CharField(max_length=50)
    haul_rate = models.IntegerField()
    amount = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    date = models.DateTimeField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    truck_type = ArrayField(models.TextField(), blank=True, default=list)
    loading_address = models.TextField()
    unloading_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Job {self.job_number} - {self.job_title}"


class Comment(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='comments')
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)