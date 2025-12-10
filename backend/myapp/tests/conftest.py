"""
Pytest configuration and shared fixtures for invoice tests.

This file contains reusable fixtures that can be used across all invoice test files.
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from django.contrib.auth.models import User
from django.utils import timezone

from myapp.models import (
    Customer, Job, Address, Operator, Truck, Driver,
    DriverTruckAssignment, JobDriverAssignment, Invoice, InvoiceLine
)


@pytest.fixture
def test_user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def test_operator(db):
    """Create a test operator."""
    return Operator.objects.create(
        name='Test Operator LLC',
        operator_type='MTO'
    )


@pytest.fixture
def test_customer(db):
    """Create a test customer."""
    return Customer.objects.create(
        company_name='Test Customer Inc',
        phone_number='555-1234',
        email='customer@test.com',
        address='123 Test St',
        city='Test City',
        state='MN'
    )


@pytest.fixture
def test_address(db):
    """Create a test address."""
    return Address.objects.create(
        street_address='123 Main Street',
        country='USA',
        state='MN',
        city='Minneapolis',
        zip_code='55401',
        location_name='Test Location',
        latitude=Decimal('44.9778'),
        longitude=Decimal('-93.2650'),
        location_type='Loading'
    )


@pytest.fixture
def test_driver(db, test_user, test_operator):
    """Create a test driver."""
    return Driver.objects.create(
        user=test_user,
        operator=test_operator,
        name='John Driver',
        email_address='john@test.com',
        phone_number='555-5678',
        driver_license='DL123456',
        contact_info='Contact info',
        address='456 Driver St'
    )


@pytest.fixture
def test_truck(db, test_operator):
    """Create a test truck."""
    return Truck.objects.create(
        operator=test_operator,
        truck_type='Dump Truck',
        carrier='Test Carrier',
        truck_number='TRUCK-001',
        license_plate='ABC123'
    )


@pytest.fixture
def test_driver_truck_assignment(db, test_driver, test_truck):
    """Create a driver-truck assignment."""
    return DriverTruckAssignment.objects.create(
        driver=test_driver,
        truck=test_truck
    )


@pytest.fixture
def test_job(db, test_address):
    """Create a test job."""
    return Job.objects.create(
        project='Test Project',
        prime_contractor='Prime Contractor Co',
        prime_contractor_project_number='PROJ-001',
        contractor_invoice='INV-001',
        contractor_invoice_project_number='CIPN-001',
        prevailing_or_not='No',
        job_description='Test job description',
        job_number='JOB-001',
        material='Gravel',
        job_date=date.today(),
        shift_start=timezone.now().time().replace(hour=8, minute=0),
        loading_address=test_address,
        unloading_address=test_address,
        job_foreman_name='Jane Foreman',
        job_foreman_contact='555-9999'
    )


@pytest.fixture
def test_job_with_assignment(db, test_job, test_driver_truck_assignment):
    """Create a job with a driver-truck assignment."""
    JobDriverAssignment.objects.create(
        job=test_job,
        driver_truck=test_driver_truck_assignment
    )
    return test_job


@pytest.fixture
def test_invoice(db, test_customer, test_job):
    """Create a test invoice."""
    invoice = Invoice.objects.create(
        customer=test_customer,
        job=test_job,
        invoice_date=date.today(),
        start_date=date.today() - timedelta(days=7),
        end_date=date.today(),
        status='Draft'
    )
    return invoice


@pytest.fixture
def test_invoice_line(db, test_invoice):
    """Create a test invoice line."""
    return InvoiceLine.objects.create(
        invoice=test_invoice,
        description='Test service',
        service_date=date.today(),
        quantity=Decimal('10.00'),
        unit_price=Decimal('100.00')
    )


@pytest.fixture
def api_client():
    """Create an API client for testing."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def authenticated_api_client(db, test_user, api_client):
    """Create an authenticated API client."""
    api_client.force_authenticate(user=test_user)
    return api_client


@pytest.fixture
def date_range():
    """Provide a date range for testing (week range)."""
    start_date = date.today() - timedelta(days=7)
    end_date = date.today()
    return {
        'start_date': start_date,
        'end_date': end_date
    }

