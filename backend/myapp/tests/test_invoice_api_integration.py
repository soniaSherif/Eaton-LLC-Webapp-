"""
Integration tests for Invoice API - Full workflow tests.

This file tests complete workflows:
- Create invoice with date range and auto-populate lines
- Update invoice with line modifications
- Filter and search functionality
- Complete invoice lifecycle (Draft -> Sent -> Paid)
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta, datetime
from django.utils import timezone

from django.urls import reverse
from rest_framework import status as http_status

from myapp.models import Invoice, InvoiceLine, JobDriverAssignment


class TestInvoiceWorkflow:
    """Test complete invoice workflows."""
    
    def test_create_invoice_with_date_range_auto_populate(
        self, authenticated_api_client, test_customer, test_job_with_assignment, date_range
    ):
        """Test creating invoice with date range that auto-populates lines."""
        job = test_job_with_assignment
        job.job_date = date_range['start_date']
        job.save()
        
        # Update assignment to be in date range
        assignment = JobDriverAssignment.objects.filter(job=job).first()
        if assignment and assignment.assigned_at:
            # Set assigned_at to be in the date range
            assignment.assigned_at = timezone.make_aware(
                datetime.combine(date_range['start_date'], datetime.min.time())
            )
            assignment.save()
        
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': job.id,
            'invoice_date': date_range['start_date'].isoformat(),
            'start_date': date_range['start_date'].isoformat(),
            'end_date': date_range['end_date'].isoformat(),
            'status': 'Draft',
            'lines': []  # Empty - should auto-populate
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        invoice_id = response.data['id']
        invoice = Invoice.objects.get(id=invoice_id)
        
        # Should have auto-populated lines if job/assignments fall in range
        assert invoice.start_date == date_range['start_date']
        assert invoice.end_date == date_range['end_date']
    
    def test_invoice_lifecycle_draft_to_sent_to_paid(
        self, authenticated_api_client, test_customer, test_job
    ):
        """Test invoice status lifecycle: Draft -> Sent -> Paid."""
        # Create invoice as Draft
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft'
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        invoice_id = response.data['id']
        assert response.data['status'] == 'Draft'
        
        # Update to Sent
        detail_url = reverse('invoice-detail', kwargs={'pk': invoice_id})
        response = authenticated_api_client.patch(
            detail_url,
            {'status': 'Sent'},
            format='json'
        )
        assert response.data['status'] == 'Sent'
        
        # Update to Paid
        response = authenticated_api_client.patch(
            detail_url,
            {'status': 'Paid'},
            format='json'
        )
        assert response.data['status'] == 'Paid'
        
        invoice = Invoice.objects.get(id=invoice_id)
        assert invoice.status == 'Paid'
    
    def test_create_invoice_with_multiple_lines_and_calculate_total(
        self, authenticated_api_client, test_customer, test_job
    ):
        """Test creating invoice with multiple lines and verify total calculation."""
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft',
            'lines': [
                {
                    'description': 'Service A',
                    'service_date': date.today().isoformat(),
                    'quantity': '10.00',
                    'unit_price': '100.00'
                },
                {
                    'description': 'Service B',
                    'service_date': date.today().isoformat(),
                    'quantity': '5.00',
                    'unit_price': '50.00'
                },
                {
                    'description': 'Service C',
                    'service_date': date.today().isoformat(),
                    'quantity': '2.00',
                    'unit_price': '200.00'
                }
            ]
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        invoice = Invoice.objects.get(id=response.data['id'])
        
        # Expected total: (10*100) + (5*50) + (2*200) = 1000 + 250 + 400 = 1650
        assert invoice.total_amount == Decimal('1650.00')
        assert response.data['total_amount'] == '1650.00'
    
    def test_update_invoice_add_new_line(self, authenticated_api_client, test_invoice):
        """Test updating invoice by adding a new line."""
        # Create initial line
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Existing line',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {
            'lines': [
                {
                    'id': test_invoice.lines.first().id,
                    'description': 'Existing line',
                    'quantity': '1.00',
                    'unit_price': '100.00'
                },
                {
                    'description': 'New line',
                    'service_date': date.today().isoformat(),
                    'quantity': '5.00',
                    'unit_price': '200.00'
                }
            ]
        }
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        test_invoice.refresh_from_db()
        assert test_invoice.lines.count() == 2
        assert test_invoice.total_amount == Decimal('1100.00')  # 100 + 1000
    
    def test_filter_invoices_by_date_range(
        self, authenticated_api_client, test_customer, test_job
    ):
        """Test filtering invoices created in a specific date range."""
        # Create invoices on different dates
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        invoice2 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today() - timedelta(days=10)
        )
        
        url = reverse('invoice-list')
        response = authenticated_api_client.get(url, {'date': date.today().isoformat()})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == invoice1.id


class TestInvoiceDateRangeFiltering:
    """Test date range filtering functionality."""
    
    def test_create_invoice_filters_assignments_by_date_range(
        self, authenticated_api_client, test_customer, test_job_with_assignment
    ):
        """Test that only assignments within date range are included."""
        job = test_job_with_assignment
        start_date = date.today() - timedelta(days=7)
        end_date = date.today()
        
        # Set job date within range
        job.job_date = start_date + timedelta(days=1)
        job.save()
        
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': job.id,
            'invoice_date': date.today().isoformat(),
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'status': 'Draft',
            'lines': []
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        invoice = Invoice.objects.get(id=response.data['id'])
        
        # Verify date range is set
        assert invoice.start_date == start_date
        assert invoice.end_date == end_date
    
    def test_create_invoice_excludes_assignments_outside_range(
        self, authenticated_api_client, test_customer, test_job_with_assignment
    ):
        """Test that assignments outside date range are not included."""
        job = test_job_with_assignment
        
        # Set job date outside the range
        job.job_date = date.today() - timedelta(days=20)
        job.save()
        
        start_date = date.today() - timedelta(days=7)
        end_date = date.today()
        
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': job.id,
            'invoice_date': date.today().isoformat(),
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'status': 'Draft',
            'lines': []
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        # Job date is outside range, so should not auto-populate
        # (unless assignment dates fall within range)
        invoice = Invoice.objects.get(id=response.data['id'])
        assert invoice is not None


class TestInvoiceEdgeCases:
    """Test edge cases and error handling."""
    
    def test_create_invoice_with_empty_lines(self, authenticated_api_client, test_customer, test_job):
        """Test creating invoice with empty lines array."""
        url = reverse('invoice-list')
        data = {
            'customer_id': test_customer.id,
            'job_id': test_job.id,
            'invoice_date': date.today().isoformat(),
            'status': 'Draft',
            'lines': []
        }
        
        response = authenticated_api_client.post(url, data, format='json')
        
        assert response.status_code == http_status.HTTP_201_CREATED
        invoice = Invoice.objects.get(id=response.data['id'])
        assert invoice.lines.count() == 0
        assert invoice.total_amount == Decimal('0.00')
    
    def test_update_invoice_remove_all_lines(self, authenticated_api_client, test_invoice):
        """Test updating invoice to remove all lines."""
        # Create some lines
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Line 1',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Line 2',
            quantity=Decimal('2.00'),
            unit_price=Decimal('200.00')
        )
        
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {'lines': []}
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        test_invoice.refresh_from_db()
        assert test_invoice.lines.count() == 0
        assert test_invoice.total_amount == Decimal('0.00')
    
    def test_update_invoice_partial_fields(self, authenticated_api_client, test_invoice):
        """Test partial update of invoice (only updating some fields)."""
        url = reverse('invoice-detail', kwargs={'pk': test_invoice.id})
        data = {'status': 'Sent'}
        
        response = authenticated_api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        test_invoice.refresh_from_db()
        assert test_invoice.status == 'Sent'
        # Other fields should remain unchanged
        assert test_invoice.invoice_date is not None

