import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../environments/environment';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiBaseUrl + 'customers/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService]
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCustomer', () => {
    it('should create a new customer', () => {
      const customerData = {
        company_name: 'Test Company',
        email: 'test@example.com',
        phone_number: '555-1234',
        address: '123 Test St',
        city: 'Test City'
      };
      const mockResponse = { id: 1, ...customerData };

      service.createCustomer(customerData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(customerData);
      req.flush(mockResponse);
    });

    it('should handle creation errors', () => {
      const customerData = { company_name: 'Test Company' };

      service.createCustomer(customerData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { company_name: ['This field is required.'] },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('getCustomers', () => {
    it('should retrieve all customers', () => {
      const mockCustomers = [
        { id: 1, company_name: 'Company 1', email: 'c1@test.com' },
        { id: 2, company_name: 'Company 2', email: 'c2@test.com' }
      ];

      service.getCustomers().subscribe(customers => {
        expect(customers).toEqual(mockCustomers);
        expect(customers.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });

    it('should return empty array when no customers exist', () => {
      service.getCustomers().subscribe(customers => {
        expect(customers).toEqual([]);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });

    it('should handle server errors', () => {
      service.getCustomers().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { error: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });
});

