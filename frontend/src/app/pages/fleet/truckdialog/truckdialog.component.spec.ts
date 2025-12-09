import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TruckdialogComponent } from './truckdialog.component';
import { TruckService } from '../../../services/truck.service';
import { OperatorService } from '../../../services/operator.service';

describe('TruckdialogComponent', () => {
  let component: TruckdialogComponent;
  let fixture: ComponentFixture<TruckdialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TruckdialogComponent>>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [TruckdialogComponent, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        TruckService,
        OperatorService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruckdialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<TruckdialogComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
