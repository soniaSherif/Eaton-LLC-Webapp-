import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DriverService } from './driver.service';
import { environment } from '../../environments/environment';

describe('DriverService', () => {
  let service: DriverService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiBaseUrl + 'drivers/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DriverService]
    });
    service = TestBed.inject(DriverService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createDriver', () => {
    it('should create a new driver', () => {
      const driverData = {
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '555-1234',
        license_number: 'DL123456'
      };
      const mockResponse = { id: 1, ...driverData };

      service.createDriver(driverData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(driverData);
      req.flush(mockResponse);
    });

    it('should handle creation errors', () => {
      const driverData = { first_name: 'John' };

      service.createDriver(driverData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { last_name: ['This field is required.'] },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('getAllDrivers', () => {
    it('should retrieve all drivers', () => {
      const mockDrivers = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];

      service.getAllDrivers().subscribe(drivers => {
        expect(drivers).toEqual(mockDrivers);
        expect(drivers.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockDrivers);
    });

    it('should return empty array when no drivers exist', () => {
      service.getAllDrivers().subscribe(drivers => {
        expect(drivers).toEqual([]);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });
});

