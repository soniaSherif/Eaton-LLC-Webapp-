import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PayReportsComponent } from './pay-reports.component';

describe('PayReportsComponent', () => {
  let component: PayReportsComponent;
  let fixture: ComponentFixture<PayReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PayReportsComponent]  // standalone comp
    }).compileComponents();

    fixture = TestBed.createComponent(PayReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
