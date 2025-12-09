import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssignTruckService } from './assign-truck.service';
import { environment } from '../../environments/environment';

describe('AssignTruckService', () => {
  let service: AssignTruckService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiBaseUrl + 'assign-truck/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssignTruckService]
    });
    service = TestBed.inject(AssignTruckService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('assignTruckToDriver', () => {
    it('should assign a truck to a driver', () => {
      const driverId = 1;
      const truckId = 2;
      const mockResponse = {
        id: 1,
        driver: driverId,
        truck: truckId,
        assigned_date: '2024-01-15'
      };

      service.assignTruckToDriver(driverId, truckId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        driver_id: driverId,
        truck_id: truckId
      });
      req.flush(mockResponse);
    });

    it('should handle assignment errors', () => {
      const driverId = 1;
      const truckId = 2;

      service.assignTruckToDriver(driverId, truckId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { error: 'Truck already assigned' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });
});

