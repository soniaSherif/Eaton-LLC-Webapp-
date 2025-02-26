from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Customers Table
class Customer(models.Model):
    name = models.TextField()
    email = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    contact_info = models.TextField(null=True, blank=True)
    contacts = models.JSONField(null=True, blank=True)  # Storing array as JSON
    dispatcher = models.TextField(null=True, blank=True)
    rate_customer = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Drivers Table
class Driver(models.Model):
    name = models.TextField()
    email_address = models.TextField(unique=True)
    phone_number = models.TextField(null=True, blank=True)
    contact_info = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Roles Table
class Role(models.Model):
    role_name = models.TextField(unique=True)

    def __str__(self):
        return self.role_name

# Users Table
class UserManager(BaseUserManager):
    def create_user(self, email_address, password=None, **extra_fields):
        if not email_address:
            raise ValueError("The Email field must be set")
        email_address = self.normalize_email(email_address)
        user = self.model(email_address=email_address, **extra_fields)
        user.set_password(password) 
        user.save(using=self._db)
        return user

    def create_superuser(self, email_address, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email_address, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email_address = models.EmailField(unique=True)
    user_name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email_address"  
    REQUIRED_FIELDS = ["user_name"]

    def __str__(self):
        return self.user_name

# User_Roles Table (Many-to-Many)
class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

# Jobs Table
class Job(models.Model):
    job_title = models.CharField(max_length=255)
    project_title = models.CharField(max_length=255)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    job_number = models.IntegerField()
    order_number = models.IntegerField()
    material = models.CharField(max_length=255)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    rate_type = models.CharField(max_length=50)
    rate = models.IntegerField()
    haul_rate_type = models.CharField(max_length=50)
    haul_rate = models.IntegerField()
    amount = models.IntegerField()
    date = models.DateTimeField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    truck_number = models.IntegerField()
    truck_type = models.JSONField()  # Storing array as JSON
    loading_address = models.TextField()
    unloading_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_title} - {self.project_title}"

# Comments Table
class Comment(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.job.job_title}"
