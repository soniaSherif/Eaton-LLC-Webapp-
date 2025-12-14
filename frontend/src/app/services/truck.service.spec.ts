import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TruckService } from './truck.service';
import { environment } from '../../environments/environment';

describe('TruckService', () => {
  let service: TruckService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiBaseUrl + 'trucks/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TruckService]
    });
    service = TestBed.inject(TruckService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTruck', () => {
    it('should create a new truck', () => {
      const truckData = {
        truck_number: 'TRUCK-001',
        make: 'Ford',
        model: 'F-150',
        year: 2020
      };
      const mockResponse = { id: 1, ...truckData };

      service.createTruck(truckData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(truckData);
      req.flush(mockResponse);
    });
  });

  describe('getAllTrucks', () => {
    it('should retrieve all trucks', () => {
      const mockTrucks = [
        { id: 1, truck_number: 'TRUCK-001', make: 'Ford' },
        { id: 2, truck_number: 'TRUCK-002', make: 'Chevy' }
      ];

      service.getAllTrucks().subscribe(trucks => {
        expect(trucks).toEqual(mockTrucks);
        expect(trucks.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrucks);
    });
  });

  describe('getUnassignedTrucks', () => {
    it('should retrieve unassigned trucks', () => {
      const mockTrucks = [
        { id: 1, truck_number: 'TRUCK-001', driver: null },
        { id: 2, truck_number: 'TRUCK-002', driver: null }
      ];

      service.getUnassignedTrucks().subscribe(trucks => {
        expect(trucks).toEqual(mockTrucks);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}unassigned-trucks/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrucks);
    });
  });
});

