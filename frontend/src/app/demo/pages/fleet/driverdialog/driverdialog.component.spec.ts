import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverdialogComponent } from './driverdialog.component';

describe('DriverdialogComponent', () => {
  let component: DriverdialogComponent;
  let fixture: ComponentFixture<DriverdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverdialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
