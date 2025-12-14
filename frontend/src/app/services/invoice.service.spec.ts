import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoiceService, Invoice, InvoiceLineItem } from './invoice.service';
import { environment } from '../../environments/environment';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiBaseUrl + 'invoices/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvoiceService]
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInvoices', () => {
    it('should retrieve all invoices without filters', () => {
      const mockInvoices: Invoice[] = [
        { id: 1, invoice_no: 'INV-001', invoice_date: '2024-01-15', status: 'Draft', customer_id: 1 },
        { id: 2, invoice_no: 'INV-002', invoice_date: '2024-01-16', status: 'Sent', customer_id: 2 }
      ];

      service.getInvoices().subscribe(invoices => {
        expect(invoices).toEqual(mockInvoices);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoices);
    });

    it('should retrieve invoices with customer filter', () => {
      const filters = { customer: 'Test Company' };
      const mockInvoices: Invoice[] = [
        { id: 1, invoice_no: 'INV-001', invoice_date: '2024-01-15', status: 'Draft', customer_id: 1 }
      ];

      service.getInvoices(filters).subscribe(invoices => {
        expect(invoices).toEqual(mockInvoices);
      });

      const req = httpMock.expectOne(`${apiUrl}?customer=Test%20Company`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoices);
    });

    it('should retrieve invoices with multiple filters', () => {
      const filters = {
        customer: 'Test Company',
        status: 'Draft',
        date: '2024-01-15'
      };
      const mockInvoices: Invoice[] = [
        { id: 1, invoice_no: 'INV-001', invoice_date: '2024-01-15', status: 'Draft', customer_id: 1 }
      ];

      service.getInvoices(filters).subscribe(invoices => {
        expect(invoices).toEqual(mockInvoices);
      });

      const req = httpMock.expectOne(
        `${apiUrl}?customer=Test%20Company&status=Draft&date=2024-01-15`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoices);
    });
  });

  describe('getInvoiceById', () => {
    it('should retrieve a single invoice by ID', () => {
      const invoiceId = 1;
      const mockInvoice: Invoice = {
        id: invoiceId,
        invoice_no: 'INV-001',
        invoice_date: '2024-01-15',
        status: 'Draft',
        customer_id: 1,
        total_amount: 1000
      };

      service.getInvoiceById(invoiceId).subscribe(invoice => {
        expect(invoice).toEqual(mockInvoice);
      });

      const req = httpMock.expectOne(`${apiUrl}${invoiceId}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoice);
    });
  });

  describe('createInvoice', () => {
    it('should create a new invoice', () => {
      const invoiceData: Invoice = {
        invoice_date: '2024-01-15',
        status: 'Draft',
        customer_id: 1,
        lines: [
          { description: 'Service 1', quantity: 1, unit_price: 100 }
        ]
      };
      const mockResponse: Invoice = {
        id: 1,
        invoice_no: 'INV-001',
        ...invoiceData
      };

      service.createInvoice(invoiceData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(invoiceData);
      req.flush(mockResponse);
    });
  });

  describe('updateInvoice', () => {
    it('should update an existing invoice', () => {
      const invoiceId = 1;
      const updateData: Partial<Invoice> = {
        status: 'Sent'
      };
      const mockResponse: Invoice = {
        id: invoiceId,
        invoice_no: 'INV-001',
        invoice_date: '2024-01-15',
        status: 'Sent',
        customer_id: 1
      };

      service.updateInvoice(invoiceId, updateData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}${invoiceId}/`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice', () => {
      const invoiceId = 1;

      service.deleteInvoice(invoiceId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}${invoiceId}/`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status', () => {
      const invoiceId = 1;
      const status: Invoice['status'] = 'Paid';
      const mockResponse: Invoice = {
        id: invoiceId,
        invoice_no: 'INV-001',
        invoice_date: '2024-01-15',
        status: 'Paid',
        customer_id: 1
      };

      service.updateInvoiceStatus(invoiceId, status).subscribe(response => {
        expect(response.status).toBe('Paid');
      });

      const req = httpMock.expectOne(`${apiUrl}${invoiceId}/`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status });
      req.flush(mockResponse);
    });
  });
});

