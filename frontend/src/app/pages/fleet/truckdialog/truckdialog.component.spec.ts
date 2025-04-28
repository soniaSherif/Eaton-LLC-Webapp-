import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckdialogComponent } from './truckdialog.component';

describe('TruckdialogComponent', () => {
  let component: TruckdialogComponent;
  let fixture: ComponentFixture<TruckdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruckdialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruckdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
