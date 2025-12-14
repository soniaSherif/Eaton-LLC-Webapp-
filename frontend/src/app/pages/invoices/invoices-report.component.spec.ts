// Basic unit test to ensure the component instantiates

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InvoicesReportComponent } from './invoices-report.component';

describe('InvoicesReportComponent', () => {
  let component: InvoicesReportComponent;      // component under test
  let fixture: ComponentFixture<InvoicesReportComponent>; // test host

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule, InvoicesReportComponent] // provide router stubs + http client + animations + component
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesReportComponent); // create
    component = fixture.componentInstance;                      // get instance
    fixture.detectChanges();                                    // initial render
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // sanity check
  });
});
