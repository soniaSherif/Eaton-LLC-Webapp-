import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetComponent } from './fleet.component';

describe('FleetComponent', () => {
  let component: FleetComponent;
  let fixture: ComponentFixture<FleetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
