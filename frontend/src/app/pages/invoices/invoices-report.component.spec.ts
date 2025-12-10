// Basic unit test to ensure the component instantiates

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { InvoicesReportComponent } from './invoices-report.component';

describe('InvoicesReportComponent', () => {
  let component: InvoicesReportComponent;      // component under test
  let fixture: ComponentFixture<InvoicesReportComponent>; // test host

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, InvoicesReportComponent] // provide router stubs + component
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesReportComponent); // create
    component = fixture.componentInstance;                      // get instance
    fixture.detectChanges();                                    // initial render
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // sanity check
  });
});
