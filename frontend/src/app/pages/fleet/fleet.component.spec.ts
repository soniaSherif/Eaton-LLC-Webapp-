import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { FleetComponent } from './fleet.component';
import { TruckService } from '../../services/truck.service';
import { DriverService } from '../../services/driver.service';

describe('FleetComponent', () => {
  let component: FleetComponent;
  let fixture: ComponentFixture<FleetComponent>;
  let truckService: jasmine.SpyObj<TruckService>;
  let driverService: jasmine.SpyObj<DriverService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const truckServiceSpy = jasmine.createSpyObj('TruckService', ['getAllTrucks']);
    const driverServiceSpy = jasmine.createSpyObj('DriverService', ['getAllDrivers']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [FleetComponent],
      providers: [
        { provide: TruckService, useValue: truckServiceSpy },
        { provide: DriverService, useValue: driverServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetComponent);
    component = fixture.componentInstance;
    truckService = TestBed.inject(TruckService) as jasmine.SpyObj<TruckService>;
    driverService = TestBed.inject(DriverService) as jasmine.SpyObj<DriverService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with trucks tab selected', () => {
    expect(component.selectedTab).toBe('trucks');
  });

  it('should fetch trucks and drivers on init', () => {
    const mockTrucks = [
      { id: 1, truck_number: 'TRUCK-001', truck_type: 'Flatbed', license_plate: 'ABC123', market: ['Local'] }
    ];
    const mockDrivers = [
      { id: 1, name: 'John Doe', driver_license: 'DL123', address: '123 St', phone_number: '555-1234' }
    ];

    truckService.getAllTrucks.and.returnValue(of(mockTrucks));
    driverService.getAllDrivers.and.returnValue(of(mockDrivers));

    fixture.detectChanges();

    expect(truckService.getAllTrucks).toHaveBeenCalled();
    expect(driverService.getAllDrivers).toHaveBeenCalled();
    expect(component.fleetData.trucks.length).toBe(1);
    expect(component.fleetData.drivers.length).toBe(1);
  });

  it('should format truck data correctly', () => {
    const mockTrucks = [
      { id: 1, truck_number: 'TRUCK-001', truck_type: 'Flatbed', license_plate: 'ABC123', market: ['Local'] }
    ];
    truckService.getAllTrucks.and.returnValue(of(mockTrucks));
    driverService.getAllDrivers.and.returnValue(of([]));

    fixture.detectChanges();

    const truck = component.fleetData.trucks[0];
    expect(truck.type).toBe('Flatbed');
    expect(truck.number).toBe('TRUCK-001');
    expect(truck.license).toBe('ABC123');
    expect(truck.market).toBe('Local');
    expect(truck.selected).toBe(false);
  });

  it('should format driver data correctly', () => {
    const mockDrivers = [
      { id: 1, name: 'John Doe', driver_license: 'DL123', address: '123 St', phone_number: '555-1234' }
    ];
    truckService.getAllTrucks.and.returnValue(of([]));
    driverService.getAllDrivers.and.returnValue(of(mockDrivers));

    fixture.detectChanges();

    const driver = component.fleetData.drivers[0];
    expect(driver.type).toBe('John Doe');
    expect(driver.number).toBe('DL123');
    expect(driver.address).toBe('123 St');
    expect(driver.phone).toBe('555-1234');
    expect(driver.selected).toBe(false);
  });

  it('should toggle all selection for trucks', () => {
    const mockTrucks = [
      { id: 1, truck_number: 'TRUCK-001', selected: false },
      { id: 2, truck_number: 'TRUCK-002', selected: false }
    ];
    truckService.getAllTrucks.and.returnValue(of(mockTrucks));
    driverService.getAllDrivers.and.returnValue(of([]));
    component.selectedTab = 'trucks';

    fixture.detectChanges();

    component.toggleAllSelection();
    expect(component.fleetData.trucks.every(t => t.selected)).toBe(true);

    component.toggleAllSelection();
    expect(component.fleetData.trucks.every(t => !t.selected)).toBe(true);
  });

  it('should toggle all selection for drivers', () => {
    const mockDrivers = [
      { id: 1, name: 'John', selected: false },
      { id: 2, name: 'Jane', selected: false }
    ];
    truckService.getAllTrucks.and.returnValue(of([]));
    driverService.getAllDrivers.and.returnValue(of(mockDrivers));
    component.selectedTab = 'drivers';

    fixture.detectChanges();

    component.toggleAllSelection();
    expect(component.fleetData.drivers.every(d => d.selected)).toBe(true);

    component.toggleAllSelection();
    expect(component.fleetData.drivers.every(d => !d.selected)).toBe(true);
  });

  it('should handle empty market array', () => {
    const mockTrucks = [
      { id: 1, truck_number: 'TRUCK-001', truck_type: 'Flatbed', license_plate: 'ABC123', market: [] }
    ];
    truckService.getAllTrucks.and.returnValue(of(mockTrucks));
    driverService.getAllDrivers.and.returnValue(of([]));

    fixture.detectChanges();

    const truck = component.fleetData.trucks[0];
    expect(truck.market).toBe('');
  });
});
