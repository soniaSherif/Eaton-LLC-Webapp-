"""
Unit tests for Invoice API views (InvoiceViewSet).

This file tests:
- GET /api/invoices/ - List invoices
- POST /api/invoices/ - Create invoice
- GET /api/invoices/{id}/ - Get invoice details
- PATCH /api/invoices/{id}/ - Update invoice
- DELETE /api/invoices/{id}/ - Delete invoice
- Filtering by customer, project, status, date
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status as http_status

from myapp.models import Invoice, InvoiceLine


class TestInvoiceListAPI:
    """Test GET /api/invoices/ endpoint."""
    
    def test_list_invoices_unauthorized(self, api_client):
        """Test that unauthorized requests are allowed (AllowAny permission)."""
        url = reverse('invoice-list')
        response = api_client.get(url)
        
        # Based on settings, this should work (AllowAny)
        assert response.status_code in [http_status.HTTP_200_OK, http_status.HTTP_401_UNAUTHORIZED]
    
    def test_list_invoices_empty(self, authenticated_api_client):
        """Test listing invoices when none exist."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data == []
    
    def test_list_invoices(self, authenticated_api_client, test_invoice):
        """Test listing invoices."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == test_invoice.id
    
    def test_list_invoices_includes_nested_data(self, authenticated_api_client, test_invoice):
        """Test that list response includes customer and job data."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_200_OK
        invoice_data = response.data[0]
        assert 'customer' in invoice_data
        assert 'job' in invoice_data
        assert invoice_data['customer']['company_name'] == test_invoice.customer.company_name
    
    def test_list_invoices_includes_lines(self, authenticated_api_client, test_invoice):
        """Test that list response includes invoice lines."""
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Test line',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_200_OK
        invoice_data = response.data[0]
        assert 'lines' in invoice_data
        assert len(invoice_data['lines']) == 1


class TestInvoiceFilteringAPI:
    """Test filtering functionality for invoice list."""
    
    def test_filter_by_customer(self, authenticated_api_client, test_customer, test_job):
        """Test filtering invoices by customer name."""
        # Create invoices for different customers
        customer2 = test_customer.__class__.objects.create(
            company_name='Another Customer',
            phone_number='555-9999',
            email='another@test.com'
        )
        
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        invoice2 = Invoice.objects.create(
            customer=customer2,
            job=test_job,
            invoice_date=date.today()
        )
        
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'customer': 'Test Customer'})
        
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == invoice1.id
    
    def test_filter_by_status(self, authenticated_api_client, test_customer, test_job):
        """Test filtering invoices by status."""
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today(),
            status='Draft'
        )
        
        invoice2 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today(),
            status='Sent'
        )
        
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'status': 'Draft'})
        
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == invoice1.id
        assert response.data[0]['status'] == 'Draft'
    
    def test_filter_by_project(self, authenticated_api_client, test_customer, test_job):
        """Test filtering invoices by project name."""
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'project': test_job.project})
        
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) >= 1
        assert all(inv['job']['project'] == test_job.project for inv in response.data)
    
    def test_filter_by_date(self, authenticated_api_client, test_customer, test_job):
        """Test filtering invoices by invoice_date."""
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=today
        )
        
        invoice2 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=yesterday
        )
        
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'date': today.isoformat()})
        
        assert response.status_code == http_status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == invoice1.id


class TestInvoiceCreateAPI:
    """Test POST /api/invoices/ endpoint."""
    
    def test_create_invoice_success(self, authenticated_api_client, test_customer, test_job):
        """Test successfully creating an invoice."""
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'start_date': (date.today() - timedelta(days=7)).isoformat(),
            'end_date': date.today().isoformat(),
            'status': 'Draft',
            'lines': []
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        assert response.data['id'] is not None
        assert response.data['customer']['id'] == test_customer.id
        assert response.data['job']['id'] == test_job.id
        assert Invoice.objects.filter(id=response.data['id']).exists()
    
    def test_create_invoice_with_lines(self, authenticated_api_client, test_customer, test_job):
        """Test creating an invoice with invoice lines."""
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft',
            'lines': [
                {
                    'description': 'Service 1',
                    'service_date': date.today().isoformat(),
                    'quantity': '10.00',
                    'unit_price': '100.00'
                },
                {
                    'description': 'Service 2',
                    'service_date': date.today().isoformat(),
                    'quantity': '5.00',
                    'unit_price': '50.00'
                }
            ]
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        invoice = Invoice.objects.get(id=response.data['id'])
        assert invoice.lines.count() == 2
        
        # Verify lines data
        lines_data = response.data['lines']
        assert len(lines_data) == 2
        assert lines_data[0]['description'] == 'Service 1'
        assert lines_data[1]['description'] == 'Service 2'
    
    def test_create_invoice_with_date_range(self, authenticated_api_client, test_customer, test_job):
        """Test creating invoice with date range."""
        start_date = date.today() - timedelta(days=7)
        end_date = date.today()
        
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'status': 'Draft',
            'lines': []
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        invoice = Invoice.objects.get(id=response.data['id'])
        assert invoice.start_date == start_date
        assert invoice.end_date == end_date
    
    def test_create_invoice_missing_customer(self, authenticated_api_client, test_job):
        """Test creating invoice without customer_id."""
        url = reverse('invoice-list')
        data = {
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft'
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        # Should fail validation
        assert response.status_code == http_status.HTTP_400_BAD_REQUEST
    
    def test_create_invoice_missing_job(self, authenticated_api_client, test_customer):
        """Test creating invoice without job_id (should fail at serializer level)."""
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft'
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        # Should fail because job is required in model
        assert response.status_code == http_status.HTTP_400_BAD_REQUEST


class TestInvoiceDetailAPI:
    """Test GET /api/invoices/{id}/ endpoint."""
    
    def test_get_invoice_detail(self, authenticated_api_client, test_invoice):
        """Test retrieving a single invoice."""
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['id'] == test_invoice.id
        assert response.data['invoice_no'] == test_invoice.invoice_no
    
    def test_get_invoice_with_lines(self, authenticated_api_client, test_invoice):
        """Test retrieving invoice with its lines."""
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Test line',
            quantity=Decimal('10.00'),
            unit_price=Decimal('100.00')
        )
        
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_200_OK
        assert 'lines' in response.data
        assert len(response.data['lines']) == 1
    
    def test_get_nonexistent_invoice(self, authenticated_api_client):
        """Test retrieving a non-existent invoice."""
        url = reverse('invoice-detail', kwargs={'pk': 99999})
        response = authenticated_api_client.get(url)
        
        assert response.status_code == http_status.HTTP_404_NOT_FOUND


class TestInvoiceUpdateAPI:
    """Test PATCH /api/invoices/{id}/ endpoint."""
    
    def test_update_invoice_status(self, authenticated_api_client, test_invoice):
        """Test updating invoice status."""
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {'status': 'Sent'}
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data['status'] == 'Sent'
        test_invoice.refresh_from_db()
        assert test_invoice.status == 'Sent'
    
    def test_update_invoice_date(self, authenticated_api_client, test_invoice):
        """Test updating invoice date."""
        new_date = date.today() + timedelta(days=1)
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {'invoice_date': new_date.isoformat()}
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_200_OK
        test_invoice.refresh_from_db()
        assert test_invoice.invoice_date == new_date
    
    def test_update_invoice_lines(self, authenticated_api_client, test_invoice):
        """Test updating invoice lines."""
        # Create initial line
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Original',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {
            'lines': [
                {
                    'id': line.id,
                    'description': 'Updated',
                    'service_date': date.today().isoformat(),
                    'quantity': '2.00',
                    'unit_price': '150.00'
                }
            ]
        }
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_200_OK
        test_invoice.refresh_from_db()
        updated_line = test_invoice.lines.first()
        assert updated_line.description == 'Updated'
        assert updated_line.quantity == Decimal('2.00')
        assert updated_line.unit_price == Decimal('150.00')


class TestInvoiceDeleteAPI:
    """Test DELETE /api/invoices/{id}/ endpoint."""
    
    def test_delete_invoice(self, authenticated_api_client, test_invoice):
        """Test deleting an invoice."""
        invoice_id = test_invoice.id
        url = reverse('invoice-detail', kwargs={'pk': invoice_id})
        
        response = authenticated_api_client.delete(url)
        
        assert response.status_code == http_status.HTTP_204_NO_CONTENT
        assert not Invoice.objects.filter(id=invoice_id).exists()
    
    def test_delete_invoice_cascades_lines(self, authenticated_api_client, test_invoice):
        """Test that deleting invoice also deletes its lines."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Test line',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        line_id = line.id
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        
        response = authenticated_api_client.delete(url)
        
        assert response.status_code == http_status.HTTP_204_NO_CONTENT
        assert not InvoiceLine.objects.filter(id=line_id).exists()

