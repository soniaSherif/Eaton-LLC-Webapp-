from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import (
    Customer, Driver, Truck, Operator, DriverTruckAssignment,
    Address, Job, JobDriverAssignment
)
import datetime


class BaseSetupMixin(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.operator = Operator.objects.create(name="OpCo", operator_type="ITO")
        self.address = Address.objects.create(
            street_address="123 Main St",
            country="USA",
            state="NY",
            city="NYC",
            zip_code="10001",
            latitude=40.7128,
            longitude=-74.0060,
            location_type="Warehouse"
        )


class CustomerTests(BaseSetupMixin):
    def test_customer_creation(self):
        customer = Customer.objects.create(
            company_name="ACME Inc",
            phone_number="1234567890",
            email="acme@example.com"
        )
        self.assertEqual(str(customer), "ACME Inc")


class DriverTests(BaseSetupMixin):
    def test_driver_creation(self):
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


class TruckTests(BaseSetupMixin):
    def test_truck_creation(self):
        truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Belly Dump",
            carrier="Carrier1",
            truck_number="T001",
            license_plate="ABC123"
        )
        self.assertEqual(str(truck), "T001")


class DriverTruckAssignmentTests(BaseSetupMixin):
    def test_driver_truck_assignment(self):
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


class JobAndAssignmentTests(BaseSetupMixin):
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

    def test_job_creation(self):
        self.assertEqual(str(self.job), "Job JOB123 - Project A")

    def test_job_driver_assignment(self):
        jda = JobDriverAssignment.objects.create(
            job=self.job,
            driver_truck=self.assignment
        )
        self.assertIn("→", str(jda))


class AssignTruckToDriverAPITest(BaseSetupMixin):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="John Tester",
            email_address="jt@example.com",
            phone_number="1234567890",
            driver_license="X123",
            contact_info="contact",
            address="addr"
        )
        self.truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Flatbed",
            carrier="CarrierX",
            truck_number="TX1",
            license_plate="XYZ987"
        )

    def test_assign_truck(self):
        url = reverse("assign_truck_to_driver")  # Ensure this is registered in urls.py
        payload = {"driver_id": self.driver.id, "truck_id": self.truck.id}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Truck assigned to driver successfully.")
        
class ProtectedEndpointTests(BaseSetupMixin):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.url = reverse('protected_view')

    def test_protected_view_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_protected_view_authenticated(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "This is a protected view!")


class AssignTruckToDriverEdgeCaseTests(BaseSetupMixin):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="DriverX",
            email_address="x@example.com",
            phone_number="0000000000",
            driver_license="D000",
            contact_info="info",
            address="123 Lane"
        )
        self.truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Dump",
            carrier="FastCarrier",
            truck_number="DUMP01",
            license_plate="DMP999"
        )
        self.url = reverse("assign_truck_to_driver")

    def test_assign_with_missing_data(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("driver_id and truck_id are required", str(response.data))

    def test_assign_with_invalid_driver_id(self):
        response = self.client.post(self.url, {
            "driver_id": 999,
            "truck_id": self.truck.id
        }, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertIn("Driver not found", str(response.data))

    def test_assign_with_invalid_truck_id(self):
        response = self.client.post(self.url, {
            "driver_id": self.driver.id,
            "truck_id": 999
        }, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertIn("Truck not found", str(response.data))

    def test_duplicate_assignment(self):
        # Assign the first time
        self.client.post(self.url, {
            "driver_id": self.driver.id,
            "truck_id": self.truck.id
        }, format="json")

        # Try assigning again without unassignment
        response = self.client.post(self.url, {
            "driver_id": self.driver.id,
            "truck_id": self.truck.id
        }, format="json")

        # Should still succeed (unless you enforce uniqueness in the model)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Truck assigned", str(response.data))


class JobDriverAssignmentEdgeTests(BaseSetupMixin):
    def setUp(self):
        super().setUp()
        self.client = APIClient()

        self.driver = Driver.objects.create(
            user=self.user,
            operator=self.operator,
            name="EdgeDriver",
            email_address="ed@example.com",
            phone_number="1112223333",
            driver_license="ED123",
            contact_info="edge",
            address="edge lane"
        )
        self.truck = Truck.objects.create(
            operator=self.operator,
            truck_type="Mixer",
            carrier="EdgeCarrier",
            truck_number="MIX123",
            license_plate="MIX999"
        )
        self.assignment = DriverTruckAssignment.objects.create(
            driver=self.driver, truck=self.truck
        )
        self.address = self.address
        self.job = Job.objects.create(
            project="Edge Job",
            prime_contractor="EdgeCo",
            prime_contractor_project_number="EPC123",
            contractor_invoice="EDINV001",
            contractor_invoice_project_number="EDPN001",
            prevailing_or_not="No",
            job_description="Edge test",
            job_number="EDGE001",
            material="Concrete",
            job_date=datetime.date.today(),
            shift_start=datetime.time(7, 30),
            loading_address=self.address,
            unloading_address=self.address,
            job_foreman_name="Ed Foreman",
            job_foreman_contact="7778889999"
        )

    def test_duplicate_jobdriver_assignment(self):
        url = reverse('jobdriverassignment-list')
        payload = {
            "job": self.job.id,
            "driver_truck": self.assignment.id
        }

        # First post
        res1 = self.client.post(url, payload, format="json")
        self.assertEqual(res1.status_code, 201)

        # Duplicate post
        res2 = self.client.post(url, payload, format="json")
        self.assertEqual(res2.status_code, 400)
        self.assertIn("unique", str(res2.data).lower())
