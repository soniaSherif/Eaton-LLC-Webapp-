import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';
import { CustomerComponent } from './customer.component';
import { CustomerService } from '../../services/customer.service';

describe('CustomerComponent', () => {
  let component: CustomerComponent;
  let fixture: ComponentFixture<CustomerComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let router: jasmine.SpyObj<Router>;
  let routerEvents: Subject<any>;

  beforeEach(async () => {
    const customerServiceSpy = jasmine.createSpyObj('CustomerService', ['getCustomers']);
    routerEvents = new Subject();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEvents.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [CustomerComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: CustomerService, useValue: customerServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
    customerService = TestBed.inject(CustomerService) as jasmine.SpyObj<CustomerService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with hardcoded customers and fetch from API', () => {
    const mockApiCustomers = [
      { id: 1, company_name: 'API Customer', email: 'api@test.com' }
    ];
    customerService.getCustomers.and.returnValue(of(mockApiCustomers));

    fixture.detectChanges();

    expect(component.customers.length).toBeGreaterThan(0);
    expect(component.customers[0].company_name).toBe('API Customer');
    expect(customerService.getCustomers).toHaveBeenCalled();
  });

  it('should add selected property to API customers', () => {
    const mockApiCustomers = [
      { id: 1, company_name: 'API Customer', email: 'api@test.com' }
    ];
    customerService.getCustomers.and.returnValue(of(mockApiCustomers));

    fixture.detectChanges();

    const apiCustomer = component.customers.find(c => c.id === 1);
    expect(apiCustomer?.selected).toBe(false);
  });

  it('should navigate to create customer page', () => {
    component.addCustomer();
    expect(router.navigate).toHaveBeenCalledWith(['/customers/create']);
  });

  it('should toggle all customer selection', () => {
    const mockApiCustomers = [
      { id: 1, company_name: 'API Customer', email: 'api@test.com' }
    ];
    customerService.getCustomers.and.returnValue(of(mockApiCustomers));
    
    fixture.detectChanges();
    const initialSelected = component.customers[0].selected;

    const mockEvent = { target: { checked: true } };
    component.toggleAllSelection(mockEvent);

    component.customers.forEach(customer => {
      expect(customer.selected).toBe(true);
    });

    const mockEvent2 = { target: { checked: false } };
    component.toggleAllSelection(mockEvent2);

    component.customers.forEach(customer => {
      expect(customer.selected).toBe(false);
    });
  });

  it('should handle API error gracefully', () => {
    // Suppress console.error for this test
    spyOn(console, 'error');
    customerService.getCustomers.and.returnValue(throwError(() => new Error('API Error')));
    
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.error).toBe('Failed to load customers. Please try again.');
    expect(component.customers.length).toBe(0); // Empty array on error
  });
});
