import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DriverdialogComponent } from './driverdialog.component';
import { OperatorService } from '../../../services/operator.service';
import { TruckService } from '../../../services/truck.service';
import { DriverService } from '../../../services/driver.service';
import { AssignTruckService } from '../../../services/assign-truck.service';
import { UserService } from '../../../services/user.service';

describe('DriverdialogComponent', () => {
  let component: DriverdialogComponent;
  let fixture: ComponentFixture<DriverdialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DriverdialogComponent>>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [DriverdialogComponent, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        OperatorService,
        TruckService,
        DriverService,
        AssignTruckService,
        UserService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverdialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<DriverdialogComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
