from django.contrib import admin
from .models import Customer, Job, Driver, Invoice, InvoiceLine, Address


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("company_name", "phone_number", "email")
    search_fields = ("company_name", "email")


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("job_number", "project", "is_completed")
    list_filter = ("is_completed", "job_date")
    search_fields = ("job_number", "project")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("number", "customer", "date", "total_amount")
    search_fields = ("number", "customer__company_name")
    list_filter = ("date",)


@admin.register(InvoiceLine)
class InvoiceLineAdmin(admin.ModelAdmin):
    list_display = ("invoice", "description", "quantity", "unit_price", "line_total")
    search_fields = ("description", "invoice__number")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("location_name", "street_address", "city", "state", "country", "zip_code", "location_type")
    search_fields = ("location_name", "street_address", "city", "state", "country")


# If you want Driver visible in admin, either register simply:
@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("id",)  # tweak with real fields, e.g., ("first_name", "last_name", "license_number")
    search_fields = ()       # add fields if you have them
