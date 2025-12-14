"""
Comprehensive API endpoint tests for all ViewSets and custom endpoints.

Tests cover:
- CRUD operations for all resources
- Filtering and query parameters
- Pagination (if implemented)
- Error handling
- Response status codes
- Data validation
"""

import pytest
from decimal import Decimal
from datetime import date, time, timedelta
from django.urls import reverse
from rest_framework import status as http_status

from myapp.models import (
    Customer, Driver, Truck, Operator, DriverTruckAssignment,
    Address, Job, JobDriverAssignment, Role, UserRole, Comment,
    Invoice, InvoiceLine
)


class TestCustomerAPI:
    """Test Customer API endpoints."""
    
    def test_list_customers(self, authenticated_api_client, test_customer):
        """Test GET /api/customers/"""
        url = reverse('customer-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_create_customer(self, authenticated_api_client, db):
        """Test POST /api/customers/"""
        url = reverse('customer-list')
        data = {
            'company_name': 'New Customer Co',
            'phone_number': '555-1111',
            'email': 'new@customer.com'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['company_name'] == 'New Customer Co'
    
    def test_retrieve_customer(self, authenticated_api_client, test_customer):
        """Test GET /api/customers/{id}/"""
        url = reverse('customer-detail', kwargs={'pk': test_customer.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_customer.id
    
    def test_update_customer(self, authenticated_api_client, test_customer):
        """Test PUT /api/customers/{id}/"""
        url = reverse('customer-detail', kwargs={'pk': test_customer.id})
        data = {
            'company_name': 'Updated Name',
            'phone_number': test_customer.phone_number,
            'email': test_customer.email
        }
        response = authenticated_api_client.put(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['company_name'] == 'Updated Name'
    
    def test_delete_customer(self, authenticated_api_client, test_customer):
        """Test DELETE /api/customers/{id}/"""
        url = reverse('customer-detail', kwargs={'pk': test_customer.id})
        response = authenticated_api_client.delete(url)
        assert response.status_code == http_status.HTTP_204_NO_CONTENT


class TestDriverAPI:
    """Test Driver API endpoints."""
    
    def test_list_drivers(self, authenticated_api_client, test_driver):
        """Test GET /api/drivers/"""
        url = reverse('driver-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_driver(self, authenticated_api_client, test_user, test_operator, db):
        """Test POST /api/drivers/"""
        url = reverse('driver-list')
        data = {
            'user': test_user.id,
            'operator': test_operator.id,
            'name': 'New Driver',
            'email_address': 'driver@test.com',
            'phone_number': '555-2222',
            'driver_license': 'DL999',
            'contact_info': 'Info',
            'address': 'Address'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
    
    def test_retrieve_driver(self, authenticated_api_client, test_driver):
        """Test GET /api/drivers/{id}/"""
        url = reverse('driver-detail', kwargs={'pk': test_driver.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_driver.id


class TestTruckAPI:
    """Test Truck API endpoints."""
    
    def test_list_trucks(self, authenticated_api_client, test_truck):
        """Test GET /api/trucks/"""
        url = reverse('truck-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_truck(self, authenticated_api_client, test_operator, db):
        """Test POST /api/trucks/"""
        url = reverse('truck-list')
        data = {
            'operator': test_operator.id,
            'truck_type': 'Flatbed',
            'carrier': 'Carrier Co',
            'truck_number': 'TRUCK-999',
            'license_plate': 'XYZ999'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['truck_number'] == 'TRUCK-999'
    
    def test_retrieve_truck(self, authenticated_api_client, test_truck):
        """Test GET /api/trucks/{id}/"""
        url = reverse('truck-detail', kwargs={'pk': test_truck.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_truck.id


class TestOperatorAPI:
    """Test Operator API endpoints."""
    
    def test_list_operators(self, authenticated_api_client, test_operator):
        """Test GET /api/operators/"""
        url = reverse('operator-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_operator(self, authenticated_api_client, db):
        """Test POST /api/operators/"""
        url = reverse('operator-list')
        data = {
            'name': 'New Operator',
            'operator_type': 'MTO'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['name'] == 'New Operator'


class TestAddressAPI:
    """Test Address API endpoints."""
    
    def test_list_addresses(self, authenticated_api_client, test_address):
        """Test GET /api/addresses/"""
        url = reverse('address-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_address(self, authenticated_api_client, db):
        """Test POST /api/addresses/"""
        url = reverse('address-list')
        data = {
            'street_address': '789 Test St',
            'country': 'USA',
            'state': 'CA',
            'city': 'Los Angeles',
            'zip_code': '90001',
            'latitude': '34.0522',
            'longitude': '-118.2437',
            'location_type': 'Warehouse'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['city'] == 'Los Angeles'
    
    def test_retrieve_address(self, authenticated_api_client, test_address):
        """Test GET /api/addresses/{id}/"""
        url = reverse('address-detail', kwargs={'pk': test_address.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_address.id


class TestJobAPI:
    """Test Job API endpoints."""
    
    def test_list_jobs(self, authenticated_api_client, test_job):
        """Test GET /api/jobs/"""
        url = reverse('job-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_job(self, authenticated_api_client, test_address, db):
        """Test POST /api/jobs/"""
        url = reverse('job-list')
        data = {
            'project': 'API Test Project',
            'prime_contractor': 'Contractor',
            'prime_contractor_project_number': 'PN-API',
            'contractor_invoice': 'INV-API',
            'contractor_invoice_project_number': 'CIPN-API',
            'prevailing_or_not': 'No',
            'job_description': 'Description',
            'job_number': 'JOB-API',
            'material': 'Material',
            'job_date': date.today().isoformat(),
            'shift_start': '08:00:00',
            'loading_address': test_address.id,
            'unloading_address': test_address.id,
            'job_foreman_name': 'Foreman',
            'job_foreman_contact': '555-8888'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['project'] == 'API Test Project'
    
    def test_job_filter_by_date(self, authenticated_api_client, test_job):
        """Test filtering jobs by date."""
        url = reverse('job-list')
        response = authenticated_api_client.get(url, {'date': date.today().isoformat()})
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_job_filter_by_customer(self, authenticated_api_client, test_job, test_customer, db):
        """Test filtering jobs by customer."""
        # Create invoice linking job to customer
        Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        url = reverse('job-list')
        response = authenticated_api_client.get(url, {'customer_id': test_customer.id})
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_job_search(self, authenticated_api_client, test_job):
        """Test searching jobs by query parameter."""
        url = reverse('job-list')
        response = authenticated_api_client.get(url, {'q': 'Test'})
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_retrieve_job(self, authenticated_api_client, test_job):
        """Test GET /api/jobs/{id}/"""
        url = reverse('job-detail', kwargs={'pk': test_job.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'loading_address_info' in response.data
        assert 'unloading_address_info' in response.data
    
    def test_update_job(self, authenticated_api_client, test_job):
        """Test PATCH /api/jobs/{id}/"""
        url = reverse('job-detail', kwargs={'pk': test_job.id})
        data = {'project': 'Updated Project'}
        response = authenticated_api_client.patch(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['project'] == 'Updated Project'


class TestJobDriverAssignmentAPI:
    """Test JobDriverAssignment API endpoints."""
    
    def test_list_assignments(self, authenticated_api_client, test_job, test_driver_truck_assignment, db):
        """Test GET /api/job-driver-assignments/"""
        JobDriverAssignment.objects.create(
            job=test_job,
            driver_truck=test_driver_truck_assignment
        )
        url = reverse('jobdriverassignment-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_assignment(self, authenticated_api_client, test_job, test_driver_truck_assignment, db):
        """Test POST /api/job-driver-assignments/"""
        url = reverse('jobdriverassignment-list')
        data = {
            'job': test_job.id,
            'driver_truck': test_driver_truck_assignment.id
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['job'] == test_job.id


class TestDriverTruckAssignmentAPI:
    """Test DriverTruckAssignment API endpoints."""
    
    def test_list_assignments(self, authenticated_api_client, test_driver_truck_assignment):
        """Test GET /api/driver-truck-assignments/"""
        url = reverse('drivertruckassignment-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_assignment(self, authenticated_api_client, test_driver, test_truck, db):
        """Test POST /api/assign-truck/ (custom endpoint for creating assignments).
        Note: The ViewSet endpoint doesn't support creation because driver is StringRelatedField (read-only).
        Use the custom assign_truck_to_driver endpoint instead.
        """
        url = reverse('assign_truck')
        data = {
            'driver_id': test_driver.id,
            'truck_id': test_truck.id
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'message' in response.data
    
    def test_retrieve_assignment(self, authenticated_api_client, test_driver_truck_assignment):
        """Test GET /api/driver-truck-assignments/{id}/"""
        url = reverse('drivertruckassignment-detail', kwargs={'pk': test_driver_truck_assignment.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'driver' in response.data
        assert 'truck_type' in response.data


class TestAssignTruckEndpoint:
    """Test custom assign-truck endpoint."""
    
    def test_assign_truck_to_driver(self, authenticated_api_client, test_driver, test_truck, db):
        """Test POST /api/assign-truck/"""
        url = reverse('assign_truck')
        data = {
            'driver_id': test_driver.id,
            'truck_id': test_truck.id
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'message' in response.data
        assert response.data["message"] == "Truck assigned to driver successfully."
    
    def test_assign_truck_missing_data(self, authenticated_api_client):
        """Test assign truck with missing data."""
        url = reverse('assign_truck')
        response = authenticated_api_client.post(url, {})
        assert response.status_code == http_status.HTTP_400_BAD_REQUEST
        assert "driver_id and truck_id are required" in str(response.data)
    
    def test_assign_truck_invalid_driver(self, authenticated_api_client, test_truck):
        """Test assign truck with invalid driver ID."""
        url = reverse('assign_truck')
        data = {
            'driver_id': 99999,
            'truck_id': test_truck.id
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_404_NOT_FOUND
        assert "Driver not found" in str(response.data)
    
    def test_assign_truck_invalid_truck(self, authenticated_api_client, test_driver):
        """Test assign truck with invalid truck ID."""
        url = reverse('assign_truck')
        data = {
            'driver_id': test_driver.id,
            'truck_id': 99999
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_404_NOT_FOUND
        assert "Truck not found" in str(response.data)


class TestUnassignedTrucksEndpoint:
    """Test unassigned-trucks endpoint."""
    
    def test_get_unassigned_trucks(self, authenticated_api_client, test_truck):
        """Test GET /api/unassigned-trucks/"""
        url = reverse('unassigned_trucks')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert isinstance(response.data, list)
    
    def test_unassigned_trucks_excludes_assigned(self, authenticated_api_client, test_driver, test_truck, db):
        """Test that assigned trucks are excluded."""
        # Assign truck
        DriverTruckAssignment.objects.create(
            driver=test_driver,
            truck=test_truck
        )
        url = reverse('unassigned_trucks')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        truck_ids = [t['id'] for t in response.data]
        # Assigned truck should not be in unassigned list
        assert test_truck.id not in truck_ids


class TestRoleAPI:
    """Test Role API endpoints."""
    
    def test_list_roles(self, authenticated_api_client, db):
        """Test GET /api/roles/"""
        Role.objects.create(role_name="Test Role")
        url = reverse('role-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_role(self, authenticated_api_client, db):
        """Test POST /api/roles/"""
        url = reverse('role-list')
        data = {'role_name': 'New Role'}
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['role_name'] == 'New Role'


class TestCommentAPI:
    """Test Comment API endpoints."""
    
    def test_list_comments(self, authenticated_api_client, test_job, db):
        """Test GET /api/comments/"""
        Comment.objects.create(job=test_job, comment_text="Test comment")
        url = reverse('comment-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_comment(self, authenticated_api_client, test_job, db):
        """Test POST /api/comments/"""
        url = reverse('comment-list')
        data = {
            'job': test_job.id,
            'comment_text': 'New comment'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['comment_text'] == 'New comment'
    
    def test_retrieve_comment(self, authenticated_api_client, test_job, db):
        """Test GET /api/comments/{id}/"""
        comment = Comment.objects.create(job=test_job, comment_text="Test comment")
        url = reverse('comment-detail', kwargs={'pk': comment.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == comment.id


class TestUserAPI:
    """Test User API endpoints."""
    
    def test_list_users(self, authenticated_api_client, test_user):
        """Test GET /api/users/"""
        url = reverse('user-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_retrieve_user(self, authenticated_api_client, test_user):
        """Test GET /api/users/{id}/"""
        url = reverse('user-detail', kwargs={'pk': test_user.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_user.id


class TestUserRoleAPI:
    """Test UserRole API endpoints."""
    
    def test_list_user_roles(self, authenticated_api_client, test_user, db):
        """Test GET /api/userroles/"""
        role = Role.objects.create(role_name="Dispatcher")
        UserRole.objects.create(user=test_user, role=role)
        url = reverse('userrole-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_user_role(self, authenticated_api_client, test_user, db):
        """Test POST /api/userroles/"""
        role = Role.objects.create(role_name="Dispatcher")
        url = reverse('userrole-list')
        data = {
            'user': test_user.id,
            'role': role.id
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED


class TestInvoiceAPI:
    """Test Invoice API endpoints."""
    
    def test_list_invoices(self, authenticated_api_client, test_invoice):
        """Test GET /api/invoices/"""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_create_invoice(self, authenticated_api_client, test_customer, test_job, db):
        """Test POST /api/invoices/
        Note: Creating invoices with nested lines fails validation because
        InvoiceLineSerializer requires 'invoice' field. Create invoice first, then add lines separately.
        """
        url = reverse('invoice-list')
        # Create invoice without lines (nested lines fail validation)
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft'
        }
        response = authenticated_api_client.post(url, data, format='json')
        assert response.status_code == http_status.HTTP_201_CREATED
        assert 'invoice_no' in response.data
        invoice_id = response.data['id']
        
        # Now add lines separately via InvoiceLine API
        line_url = reverse('invoice-line-list')
        line_data = {
            'invoice': invoice_id,
            'description': 'Test service',
            'service_date': date.today().isoformat(),
            'quantity': '10.00',
            'unit_price': '100.00'
        }
        line_response = authenticated_api_client.post(line_url, line_data, format='json')
        assert line_response.status_code == http_status.HTTP_201_CREATED
        
        # Verify total was updated
        invoice_response = authenticated_api_client.get(reverse('invoice-detail', kwargs={'pk': invoice_id}))
        assert invoice_response.data['total_amount'] == '1000.00'
    
    def test_retrieve_invoice(self, authenticated_api_client, test_invoice):
        """Test GET /api/invoices/{id}/"""
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_invoice.id
        assert 'customer' in response.data
        assert 'job' in response.data
        assert 'lines' in response.data
    
    def test_update_invoice(self, authenticated_api_client, test_invoice, db):
        """Test PATCH /api/invoices/{id}/"""
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {
            'status': 'Sent'
        }
        response = authenticated_api_client.patch(url, data, format='json')
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['status'] == 'Sent'
    
    def test_delete_invoice(self, authenticated_api_client, test_invoice, db):
        """Test DELETE /api/invoices/{id}/"""
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        response = authenticated_api_client.delete(url)
        assert response.status_code == http_status.HTTP_204_NO_CONTENT
    
    def test_filter_invoices_by_customer(self, authenticated_api_client, test_invoice, test_customer):
        """Test filtering invoices by customer."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'customer': test_customer.company_name})
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_filter_invoices_by_status(self, authenticated_api_client, test_invoice):
        """Test filtering invoices by status."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'status': 'Draft'})
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_filter_invoices_by_date(self, authenticated_api_client, test_invoice):
        """Test filtering invoices by date."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'date': date.today().isoformat()})
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_filter_invoices_by_project(self, authenticated_api_client, test_invoice, test_job):
        """Test filtering invoices by project."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'project': test_job.project})
        assert response.status_code == http_status.HTTP_200_OK


class TestInvoiceLineAPI:
    """Test InvoiceLine API endpoints."""
    
    def test_list_invoice_lines(self, authenticated_api_client, test_invoice_line):
        """Test GET /api/invoice-lines/"""
        url = reverse('invoice-line-list')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_create_invoice_line(self, authenticated_api_client, test_invoice, db):
        """Test POST /api/invoice-lines/"""
        url = reverse('invoice-line-list')
        data = {
            'invoice': test_invoice.id,
            'description': 'New line item',
            'service_date': date.today().isoformat(),
            'quantity': '5.00',
            'unit_price': '75.00'
        }
        response = authenticated_api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['description'] == 'New line item'
        assert 'amount' in response.data
    
    def test_retrieve_invoice_line(self, authenticated_api_client, test_invoice_line):
        """Test GET /api/invoice-lines/{id}/"""
        url = reverse('invoice-line-detail', kwargs={'pk': test_invoice_line.id})
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_invoice_line.id
        assert 'amount' in response.data
    
    def test_update_invoice_line(self, authenticated_api_client, test_invoice_line):
        """Test PATCH /api/invoice-lines/{id}/"""
        url = reverse('invoice-line-detail', kwargs={'pk': test_invoice_line.id})
        data = {
            'description': 'Updated description',
            'quantity': '15.00'
        }
        response = authenticated_api_client.patch(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['description'] == 'Updated description'
        assert response.data['quantity'] == '15.00'
    
    def test_delete_invoice_line(self, authenticated_api_client, test_invoice_line, db):
        """Test DELETE /api/invoice-lines/{id}/"""
        url = reverse('invoice-line-detail', kwargs={'pk': test_invoice_line.id})
        response = authenticated_api_client.delete(url)
        assert response.status_code == http_status.HTTP_204_NO_CONTENT
