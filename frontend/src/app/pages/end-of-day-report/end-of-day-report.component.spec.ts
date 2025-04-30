import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndOfDayReportComponent } from './end-of-day-report.component';

describe('EndOfDayReportComponent', () => {
  let component: EndOfDayReportComponent;
  let fixture: ComponentFixture<EndOfDayReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndOfDayReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndOfDayReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
