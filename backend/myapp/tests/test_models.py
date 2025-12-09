"""
Comprehensive unit tests for all models.

Tests cover:
- Model creation and validation
- String representations
- Relationships and foreign keys
- Custom methods and properties
- Model constraints and business logic
"""

from django.test import TestCase
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import date, time
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from myapp.models import (
    Customer, Driver, Truck, Operator, DriverTruckAssignment,
    Address, Job, JobDriverAssignment, Role, UserRole, Comment,
    Invoice, InvoiceLine
)
import datetime


class BaseSetupMixin(TestCase):
    """Base setup for all model tests."""
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.operator = Operator.objects.create(name="OpCo", operator_type="ITO")
        self.address = Address.objects.create(
            street_address="123 Main St",
            country="USA",
            state="NY",
            city="NYC",
            zip_code="10001",
            latitude=Decimal('40.7128'),
            longitude=Decimal('-74.0060'),
            location_type="Warehouse"
        )


class CustomerTests(BaseSetupMixin):
    """Test Customer model."""
    
    def test_customer_creation(self):
        """Test customer can be created with required fields."""
        customer = Customer.objects.create(
            company_name="ACME Inc",
            phone_number="1234567890",
            email="acme@example.com"
        )
        self.assertEqual(str(customer), "ACME Inc")
        self.assertIsNotNone(customer.id)
        self.assertIsNotNone(customer.created_at)
    
    def test_customer_optional_fields(self):
        """Test customer optional fields."""
        customer = Customer.objects.create(
            company_name="Test Company",
            phone_number="555-1234",
            email="test@company.com",
            company_dba_name="DBA Name",
            address="123 Street",
            city="City",
            additional_comments="Comments"
        )
        self.assertEqual(customer.company_dba_name, "DBA Name")
        self.assertEqual(customer.address, "123 Street")


class OperatorTests(BaseSetupMixin):
    """Test Operator model."""
    
    def test_operator_creation(self):
        """Test operator creation."""
        operator = Operator.objects.create(
            name="Test Operator",
            operator_type="ITO"
        )
        self.assertIsNotNone(operator.id)
        self.assertIn("Test Operator", str(operator))
        self.assertIn("ITO", str(operator))
    
    def test_operator_type_choices(self):
        """Test operator type choices."""
        operator_mto = Operator.objects.create(
            name="MTO Operator",
            operator_type="MTO"
        )
        operator_ito = Operator.objects.create(
            name="ITO Operator",
            operator_type="ITO"
        )
        self.assertEqual(operator_mto.operator_type, "MTO")
        self.assertEqual(operator_ito.operator_type, "ITO")


class AddressTests(BaseSetupMixin):
    """Test Address model."""
    
    def test_address_creation(self):
        """Test address creation."""
        self.assertIsNotNone(self.address.id)
        self.assertIn("123 Main St", str(self.address))
        self.assertIn("NYC", str(self.address))
    
    def test_address_location_fields(self):
        """Test address location coordinates."""
        address = Address.objects.create(
            street_address="456 Test Ave",
            country="USA",
            state="CA",
            city="San Francisco",
            zip_code="94102",
            latitude=Decimal('37.7749'),
            longitude=Decimal('-122.4194'),
            location_type="Warehouse"
        )
        self.assertEqual(address.latitude, Decimal('37.7749'))
        self.assertEqual(address.longitude, Decimal('-122.4194'))


class TruckTests(BaseSetupMixin):
    """Test Truck model."""
    
    def test_truck_creation(self):
        """Test truck creation."""
        truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Belly Dump",
            carrier="Carrier1",
            truck_number="T001",
            license_plate="ABC123"
        )
        self.assertEqual(str(truck), "T001")
        self.assertIsNotNone(truck.id)
    
    def test_truck_operator_relationship(self):
        """Test truck belongs to operator."""
        truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Dump Truck",
            carrier="Carrier Co",
            truck_number="TRUCK-001",
            license_plate="ABC123"
        )
        self.assertEqual(truck.operator, self.operator)
        self.assertEqual(truck.operator.operator_type, self.operator.operator_type)


class DriverTests(BaseSetupMixin):
    """Test Driver model."""
    
    def test_driver_creation(self):
        """Test driver creation."""
        driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="John Doe",
            email_address="john@example.com",
            phone_number="5551234567",
            driver_license="DL123456",
            contact_info="Some info",
            address="456 Driver St"
        )
        self.assertEqual(str(driver), "John Doe")
        self.assertEqual(driver.truck_count, 1)
        self.assertIsNotNone(driver.id)
    
    def test_driver_user_relationship(self):
        """Test driver has user relationship."""
        driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="Driver Name",
            email_address="driver@test.com",
            phone_number="555-5678",
            driver_license="DL123",
            contact_info="Info",
            address="Address"
        )
        self.assertEqual(driver.user, self.user)


class DriverTruckAssignmentTests(BaseSetupMixin):
    """Test DriverTruckAssignment model."""
    
    def test_driver_truck_assignment(self):
        """Test assignment creation."""
        driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="John Doe",
            email_address="john@example.com",
            phone_number="5551234567",
            driver_license="DL123456",
            contact_info="Some info",
            address="456 Driver St"
        )
        truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Belly Dump",
            carrier="Carrier1",
            truck_number="T001",
            license_plate="ABC123"
        )
        assignment = DriverTruckAssignment.objects.create(driver=driver, truck=truck)
        self.assertIn("assigned to", str(assignment))
        self.assertIsNotNone(assignment.assigned_at)
        self.assertIsNone(assignment.unassigned_at)
    
    def test_unassign_truck(self):
        """Test unassigning a truck."""
        driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="John Doe",
            email_address="john@example.com",
            phone_number="5551234567",
            driver_license="DL123456",
            contact_info="Some info",
            address="456 Driver St"
        )
        truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Belly Dump",
            carrier="Carrier1",
            truck_number="T001",
            license_plate="ABC123"
        )
        assignment = DriverTruckAssignment.objects.create(driver=driver, truck=truck)
        self.assertIsNone(assignment.unassigned_at)
        assignment.unassigned_at = timezone.now()
        assignment.save()
        self.assertIsNotNone(assignment.unassigned_at)


class JobTests(BaseSetupMixin):
    """Test Job model."""
    
    def setUp(self):
        super().setUp()
        self.job = Job.objects.create(
            project="Project A",
            prime_contractor="Prime Co",
            prime_contractor_project_number="PC123",
            contractor_invoice="INV123",
            contractor_invoice_project_number="CIPN123",
            prevailing_or_not="Yes",
            job_description="Haul dirt",
            job_number="JOB123",
            material="Dirt",
            job_date=datetime.date.today(),
            shift_start=datetime.time(8, 0),
            loading_address=self.address,
            unloading_address=self.address,
            job_foreman_name="Jane",
            job_foreman_contact="5559876543"
        )
    
    def test_job_creation(self):
        """Test job creation."""
        self.assertEqual(str(self.job), "Job JOB123 - Project A")
        self.assertIsNotNone(self.job.id)
    
    def test_job_addresses(self):
        """Test job loading and unloading addresses."""
        self.assertEqual(self.job.loading_address, self.address)
        self.assertEqual(self.job.unloading_address, self.address)
    
    def test_job_backhaul_addresses(self):
        """Test job backhaul addresses."""
        job = Job.objects.create(
            project="Project",
            prime_contractor="Contractor",
            prime_contractor_project_number="PN-001",
            contractor_invoice="INV-001",
            contractor_invoice_project_number="CIPN-001",
            prevailing_or_not="No",
            job_description="Description",
            job_number="JOB-003",
            material="Material",
            job_date=datetime.date.today(),
            shift_start=datetime.time(8, 0),
            loading_address=self.address,
            unloading_address=self.address,
            is_backhaul_enabled=True,
            backhaul_loading_address=self.address,
            backhaul_unloading_address=self.address,
            job_foreman_name="Foreman",
            job_foreman_contact="555-9999"
        )
        self.assertTrue(job.is_backhaul_enabled)
        self.assertEqual(job.backhaul_loading_address, self.address)


class JobDriverAssignmentTests(BaseSetupMixin):
    """Test JobDriverAssignment model."""
    
    def setUp(self):
        super().setUp()
        self.driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="John Doe",
            email_address="john@example.com",
            phone_number="5551234567",
            driver_license="DL123456",
            contact_info="Some info",
            address="456 Driver St"
        )
        self.truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Belly Dump",
            carrier="Carrier1",
            truck_number="T001",
            license_plate="ABC123"
        )
        self.assignment = DriverTruckAssignment.objects.create(
            driver=self.driver,
            truck=self.truck
        )
        self.job = Job.objects.create(
            project="Project A",
            prime_contractor="Prime Co",
            prime_contractor_project_number="PC123",
            contractor_invoice="INV123",
            contractor_invoice_project_number="CIPN123",
            prevailing_or_not="Yes",
            job_description="Haul dirt",
            job_number="JOB123",
            material="Dirt",
            job_date=datetime.date.today(),
            shift_start=datetime.time(8, 0),
            loading_address=self.address,
            unloading_address=self.address,
            job_foreman_name="Jane",
            job_foreman_contact="5559876543"
        )
    
    def test_job_driver_assignment_creation(self):
        """Test job driver assignment creation."""
        assignment = JobDriverAssignment.objects.create(
            job=self.job,
            driver_truck=self.assignment
        )
        self.assertIsNotNone(assignment.id)
        self.assertEqual(assignment.job, self.job)
        self.assertEqual(assignment.driver_truck, self.assignment)
    
    def test_job_driver_assignment_str(self):
        """Test string representation."""
        assignment = JobDriverAssignment.objects.create(
            job=self.job,
            driver_truck=self.assignment
        )
        self.assertIn("→", str(assignment))
        self.assertIn(self.job.job_number, str(assignment))
    
    def test_job_driver_assignment_unique_constraint(self):
        """Test unique constraint prevents duplicate assignments."""
        JobDriverAssignment.objects.create(
            job=self.job,
            driver_truck=self.assignment
        )
        
        # Try to create duplicate
        with self.assertRaises(Exception):  # Should raise IntegrityError
            JobDriverAssignment.objects.create(
                job=self.job,
                driver_truck=self.assignment
            )


class RoleTests(BaseSetupMixin):
    """Test Role model."""
    
    def test_role_creation(self):
        """Test role creation."""
        role = Role.objects.create(role_name="Dispatcher")
        self.assertIsNotNone(role.id)
        self.assertEqual(str(role), "Dispatcher")


class UserRoleTests(BaseSetupMixin):
    """Test UserRole model."""
    
    def test_user_role_creation(self):
        """Test user role assignment."""
        role = Role.objects.create(role_name="Dispatcher")
        user_role = UserRole.objects.create(user=self.user, role=role)
        self.assertIsNotNone(user_role.id)
        self.assertEqual(user_role.user, self.user)
        self.assertEqual(user_role.role, role)
        self.assertIsNotNone(user_role.assigned_at)


class CommentTests(BaseSetupMixin):
    """Test Comment model."""
    
    def setUp(self):
        super().setUp()
        self.job = Job.objects.create(
            project="Project A",
            prime_contractor="Prime Co",
            prime_contractor_project_number="PC123",
            contractor_invoice="INV123",
            contractor_invoice_project_number="CIPN123",
            prevailing_or_not="Yes",
            job_description="Haul dirt",
            job_number="JOB123",
            material="Dirt",
            job_date=datetime.date.today(),
            shift_start=datetime.time(8, 0),
            loading_address=self.address,
            unloading_address=self.address,
            job_foreman_name="Jane",
            job_foreman_contact="5559876543"
        )
    
    def test_comment_creation(self):
        """Test comment creation."""
        comment = Comment.objects.create(
            job=self.job,
            comment_text="Test comment"
        )
        self.assertIsNotNone(comment.id)
        self.assertEqual(comment.job, self.job)
        self.assertEqual(comment.comment_text, "Test comment")
        self.assertIsNotNone(comment.created_at)


class InvoiceTests(BaseSetupMixin):
    """Test Invoice model."""
    
    def setUp(self):
        super().setUp()
        self.customer = Customer.objects.create(
            company_name="Test Customer",
            phone_number="555-1234",
            email="test@customer.com"
        )
        self.job = Job.objects.create(
            project="Project A",
            prime_contractor="Prime Co",
            prime_contractor_project_number="PC123",
            contractor_invoice="INV123",
            contractor_invoice_project_number="CIPN123",
            prevailing_or_not="Yes",
            job_description="Haul dirt",
            job_number="JOB123",
            material="Dirt",
            job_date=datetime.date.today(),
            shift_start=datetime.time(8, 0),
            loading_address=self.address,
            unloading_address=self.address,
            job_foreman_name="Jane",
            job_foreman_contact="5559876543"
        )
    
    def test_invoice_creation(self):
        """Test invoice creation."""
        invoice = Invoice.objects.create(
            customer=self.customer,
            job=self.job,
            invoice_date=datetime.date.today(),
            status='Draft'
        )
        self.assertIsNotNone(invoice.id)
        self.assertIsNotNone(invoice.invoice_no)
        self.assertTrue(invoice.invoice_no.startswith('INV-'))
        self.assertEqual(str(invoice), invoice.invoice_no)
        self.assertEqual(invoice.total_amount, Decimal('0.00'))
    
    def test_invoice_number_auto_generation(self):
        """Test invoice numbers are auto-generated uniquely."""
        invoice1 = Invoice.objects.create(
            customer=self.customer,
            job=self.job,
            invoice_date=datetime.date.today()
        )
        invoice2 = Invoice.objects.create(
            customer=self.customer,
            job=self.job,
            invoice_date=datetime.date.today()
        )
        self.assertNotEqual(invoice1.invoice_no, invoice2.invoice_no)
        self.assertTrue(invoice1.invoice_no.startswith('INV-'))
        self.assertTrue(invoice2.invoice_no.startswith('INV-'))
    
    def test_invoice_status_choices(self):
        """Test invoice status choices."""
        statuses = ['Draft', 'Sent', 'Paid', 'Overdue', 'Void']
        for status in statuses:
            invoice = Invoice.objects.create(
                customer=self.customer,
                job=self.job,
                invoice_date=datetime.date.today(),
                status=status
            )
            self.assertEqual(invoice.status, status)
    
    def test_invoice_recalc_totals(self):
        """Test invoice total recalculation."""
        invoice = Invoice.objects.create(
            customer=self.customer,
            job=self.job,
            invoice_date=datetime.date.today()
        )
        InvoiceLine.objects.create(
            invoice=invoice,
            description="Line 1",
            quantity=Decimal('10.00'),
            unit_price=Decimal('100.00')
        )
        InvoiceLine.objects.create(
            invoice=invoice,
            description="Line 2",
            quantity=Decimal('5.00'),
            unit_price=Decimal('50.00')
        )
        
        invoice.recalc_totals()
        self.assertEqual(invoice.total_amount, Decimal('1250.00'))


class InvoiceLineTests(BaseSetupMixin):
    """Test InvoiceLine model."""
    
    def setUp(self):
        super().setUp()
        self.customer = Customer.objects.create(
            company_name="Test Customer",
            phone_number="555-1234",
            email="test@customer.com"
        )
        self.job = Job.objects.create(
            project="Project A",
            prime_contractor="Prime Co",
            prime_contractor_project_number="PC123",
            contractor_invoice="INV123",
            contractor_invoice_project_number="CIPN123",
            prevailing_or_not="Yes",
            job_description="Haul dirt",
            job_number="JOB123",
            material="Dirt",
            job_date=datetime.date.today(),
            shift_start=datetime.time(8, 0),
            loading_address=self.address,
            unloading_address=self.address,
            job_foreman_name="Jane",
            job_foreman_contact="5559876543"
        )
        self.invoice = Invoice.objects.create(
            customer=self.customer,
            job=self.job,
            invoice_date=datetime.date.today()
        )
    
    def test_invoice_line_creation(self):
        """Test invoice line creation."""
        line = InvoiceLine.objects.create(
            invoice=self.invoice,
            description="Test line",
            quantity=Decimal('5.00'),
            unit_price=Decimal('100.00')
        )
        self.assertIsNotNone(line.id)
        self.assertEqual(line.line_total, Decimal('500.00'))
    
    def test_invoice_line_total_calculation(self):
        """Test line total is calculated on save."""
        line = InvoiceLine(
            invoice=self.invoice,
            description="Test",
            quantity=Decimal('10.00'),
            unit_price=Decimal('25.50')
        )
        # line_total is only calculated on save, so before save it's the default
        self.assertEqual(line.line_total, Decimal('0.00'))
        line.save()
        line.refresh_from_db()
        self.assertEqual(line.line_total, Decimal('255.00'))
    
    def test_invoice_line_auto_updates_invoice_total(self):
        """Test that invoice total updates when line is added."""
        initial_total = self.invoice.total_amount
        InvoiceLine.objects.create(
            invoice=self.invoice,
            description="New line",
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        self.invoice.refresh_from_db()
        self.assertGreater(self.invoice.total_amount, initial_total)
    
    def test_invoice_line_deletion_updates_invoice(self):
        """Test that invoice total updates when line is deleted."""
        line = InvoiceLine.objects.create(
            invoice=self.invoice,
            description="Line to delete",
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        total_with_line = self.invoice.total_amount
        line.delete()
        self.invoice.refresh_from_db()
        self.assertLess(self.invoice.total_amount, total_with_line)
