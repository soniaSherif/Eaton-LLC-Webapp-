"""
Unit tests for Invoice and InvoiceLine models.

This file tests:
- Invoice model creation and validation
- Invoice number auto-generation
- Invoice total calculation
- Date range functionality
- InvoiceLine model creation and calculation
- Line total calculation
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError

from myapp.models import Invoice, InvoiceLine


class TestInvoiceModel:
    """Test Invoice model functionality."""
    
    def test_invoice_creation(self, test_customer, test_job):
        """Test that an invoice can be created with required fields."""
        invoice = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today(),
            status='Draft'
        )
        
        assert invoice.id is not None
        assert invoice.customer == test_customer
        assert invoice.job == test_job
        assert invoice.status == 'Draft'
        assert invoice.total_amount == Decimal('0.00')
        assert invoice.invoice_no is not None
        assert len(invoice.invoice_no) > 0
    
    def test_invoice_number_auto_generation(self, test_customer, test_job):
        """Test that invoice numbers are automatically generated."""
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        invoice2 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        assert invoice1.invoice_no != invoice2.invoice_no
        assert invoice1.invoice_no.startswith('INV-')
        assert invoice2.invoice_no.startswith('INV-')
    
    def test_invoice_with_date_range(self, test_customer, test_job):
        """Test invoice creation with date range (start_date and end_date)."""
        start_date = date.today() - timedelta(days=7)
        end_date = date.today()
        
        invoice = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today(),
            start_date=start_date,
            end_date=end_date,
            status='Draft'
        )
        
        assert invoice.start_date == start_date
        assert invoice.end_date == end_date
    
    def test_invoice_date_range_optional(self, test_customer, test_job):
        """Test that date range fields are optional."""
        invoice = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        assert invoice.start_date is None
        assert invoice.end_date is None
    
    def test_invoice_str_representation(self, test_invoice):
        """Test invoice string representation."""
        assert str(test_invoice) == test_invoice.invoice_no
    
    def test_invoice_recalc_totals(self, test_invoice):
        """Test that invoice totals are recalculated correctly."""
        # Create invoice lines
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Service 1',
            quantity=Decimal('5.00'),
            unit_price=Decimal('100.00')
        )
        
        InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Service 2',
            quantity=Decimal('3.00'),
            unit_price=Decimal('50.00')
        )
        
        # Recalculate totals
        test_invoice.recalc_totals()
        
        # Expected total: (5 * 100) + (3 * 50) = 500 + 150 = 650
        assert test_invoice.total_amount == Decimal('650.00')
    
    def test_invoice_status_choices(self, test_customer, test_job):
        """Test that invoice status uses valid choices."""
        valid_statuses = ['Draft', 'Sent', 'Paid', 'Overdue', 'Void']
        
        for status in valid_statuses:
            invoice = Invoice.objects.create(
                customer=test_customer,
                job=test_job,
                invoice_date=date.today(),
                status=status
            )
            assert invoice.status == status
    
    def test_invoice_customer_protection(self, test_customer, test_job):
        """Test that customer is protected from deletion when invoice exists."""
        invoice = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        # Attempting to delete customer should raise ProtectedError
        with pytest.raises(Exception):  # Django's ProtectedError
            test_customer.delete()


class TestInvoiceLineModel:
    """Test InvoiceLine model functionality."""
    
    def test_invoice_line_creation(self, test_invoice):
        """Test that an invoice line can be created."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Test service',
            service_date=date.today(),
            quantity=Decimal('10.00'),
            unit_price=Decimal('100.00')
        )
        
        assert line.id is not None
        assert line.invoice == test_invoice
        assert line.description == 'Test service'
        assert line.quantity == Decimal('10.00')
        assert line.unit_price == Decimal('100.00')
        assert line.line_total == Decimal('1000.00')  # Should auto-calculate
    
    def test_invoice_line_total_auto_calculation(self, test_invoice):
        """Test that line totals are automatically calculated on save."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Calculation test',
            quantity=Decimal('5.50'),
            unit_price=Decimal('75.25')
        )
        
        # Expected: 5.50 * 75.25 = 413.875
        assert line.line_total == Decimal('413.88')  # Rounded to 2 decimal places
    
    def test_invoice_line_with_zero_values(self, test_invoice):
        """Test invoice line with zero quantity and price."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Free service',
            quantity=Decimal('0.00'),
            unit_price=Decimal('0.00')
        )
        
        assert line.line_total == Decimal('0.00')
    
    def test_invoice_line_service_date_optional(self, test_invoice):
        """Test that service_date is optional."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='No service date',
            quantity=Decimal('1.00'),
            unit_price=Decimal('50.00')
        )
        
        assert line.service_date is None
    
    def test_invoice_line_str_representation(self, test_invoice_line):
        """Test invoice line string representation."""
        expected = f"{test_invoice_line.description} - {test_invoice_line.line_total}"
        assert str(test_invoice_line) == expected
    
    def test_invoice_line_cascade_delete(self, test_invoice):
        """Test that invoice lines are deleted when invoice is deleted."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Test line',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        line_id = line.id
        test_invoice.delete()
        
        # Line should be deleted
        assert not InvoiceLine.objects.filter(id=line_id).exists()
    
    def test_invoice_line_updates_total_on_change(self, test_invoice):
        """Test that changing quantity or price updates line total."""
        line = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Update test',
            quantity=Decimal('10.00'),
            unit_price=Decimal('100.00')
        )
        
        assert line.line_total == Decimal('1000.00')
        
        # Update quantity
        line.quantity = Decimal('20.00')
        line.save()
        line.refresh_from_db()
        assert line.line_total == Decimal('2000.00')
        
        # Update price
        line.unit_price = Decimal('150.00')
        line.save()
        line.refresh_from_db()
        assert line.line_total == Decimal('3000.00')


class TestInvoiceModelRelationships:
    """Test relationships between Invoice and related models."""
    
    def test_invoice_has_multiple_lines(self, test_invoice):
        """Test that an invoice can have multiple lines."""
        line1 = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Line 1',
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        line2 = InvoiceLine.objects.create(
            invoice=test_invoice,
            description='Line 2',
            quantity=Decimal('2.00'),
            unit_price=Decimal('200.00')
        )
        
        assert test_invoice.lines.count() == 2
        assert line1 in test_invoice.lines.all()
        assert line2 in test_invoice.lines.all()
    
    def test_invoice_access_customer(self, test_invoice):
        """Test accessing customer through invoice."""
        assert test_invoice.customer is not None
        assert test_invoice.customer.company_name == 'Test Customer Inc'
    
    def test_invoice_access_job(self, test_invoice):
        """Test accessing job through invoice."""
        assert test_invoice.job is not None
        assert test_invoice.job.job_number == 'JOB-001'
    
    def test_customer_has_invoices(self, test_customer, test_job):
        """Test reverse relationship from customer to invoices."""
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        invoice2 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        assert test_customer.invoices.count() == 2
        assert invoice1 in test_customer.invoices.all()
        assert invoice2 in test_customer.invoices.all()
    
    def test_job_has_invoices(self, test_customer, test_job):
        """Test reverse relationship from job to invoices."""
        invoice1 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        invoice2 = Invoice.objects.create(
            customer=test_customer,
            job=test_job,
            invoice_date=date.today()
        )
        
        assert test_job.invoices.count() == 2
        assert invoice1 in test_job.invoices.all()
        assert invoice2 in test_job.invoices.all()

