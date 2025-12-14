import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TruckService } from 'src/app/services/truck.service';
import { OperatorService } from 'src/app/services/operator.service';

@Component({
  selector: 'app-truckdialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './truckdialog.component.html',
  styleUrls: ['./truckdialog.component.scss'],
})
export class TruckdialogComponent {
  isEditMode = false;
  editingTruckId: number | null = null;

  constructor(
    public dialog: MatDialogRef<TruckdialogComponent>,
    private truckService: TruckService,
    private operatorService: OperatorService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Form inputs
  selectedTruck_type = '';
  selectedCarrier = '';
  selectedTruck_number = '';
  selectedLicense_plate = '';
  selectedMarket = '';
  selectedOperatorId = '';
  selectedPlate_expiry_date = '';  // 'YYYY-MM-DD'


  // Logic to switch between create/select
  creatingNewOperator = false;
  newOperatorName = '';
  newOperatorType = 'ITO';

  truckType: string[] = [];
  carrier: string[] = [];
  market: string[] = [];
  operatorList: any[] = [];

  ngOnInit() {
    if (this.data && this.data.mode === 'edit' && this.data.truck) {
      this.isEditMode = true;
      const t = this.data.truck;

      this.editingTruckId = t.id;

      // basic fields (these were already working)
      this.selectedTruck_type   = t.truck_type ?? t.type ?? '';
      this.selectedCarrier      = t.carrier ?? '';
      this.selectedTruck_number = t.truck_number ?? t.number ?? '';
      this.selectedLicense_plate = t.license_plate ?? t.license ?? '';

      // PLATE EXPIRY DATE – try several possible field names, then slice to YYYY-MM-DD
      const rawPlate =
        t.plate_expiry_date ??
        t.plateExpiryDate ??
        t.plate_expiry ??
        null;

      this.selectedPlate_expiry_date = rawPlate
        ? String(rawPlate).slice(0, 10)
        : '';

      // MARKET – handle string or array
      const rawMarket = Array.isArray(t.market)
        ? (t.market[0] ?? '')
        : (t.market ?? t.market_display ?? '');

      this.selectedMarket = rawMarket;

      // operator id if present
      if (t.operator) {
        this.selectedOperatorId = String(t.operator);
      }
  } else {
    this.isEditMode = false;
  }
    this.truckType = [
      '10 Wheeler',
      '10 Wheeler Live Floor',
      '10 Wheeler (Rough)',
      '3-Eixos',
      '4-Eixos',
    ];
    this.carrier = ['M Eaton Trucking'];
    this.market = ['Company Driver', 'Prevailing', 'Proechel Trucking'];
  
    this.operatorService.getOperators().subscribe((data) => {
      this.operatorList = data;
    });
  }
submitForm(): void {
  if (!this.selectedPlate_expiry_date) {
    alert('Plate expiry date is required.');
    return;
  }

  // ---------- EDIT MODE ----------
  if (this.isEditMode && this.editingTruckId) {
    const original = this.data.truck;

    // keep previous operator unless user selects another
    let operatorId = original.operator;
    if (this.selectedOperatorId) {
      operatorId = parseInt(this.selectedOperatorId, 10);
    }

    const payload: any = {
      truck_type: this.selectedTruck_type,
      carrier: this.selectedCarrier,
      truck_number: this.selectedTruck_number,
      license_plate: this.selectedLicense_plate,
      plate_expiry_date: this.selectedPlate_expiry_date,
      market: [this.selectedMarket],
      operator: operatorId,
    };

    this.truckService.updateTruck(this.editingTruckId, payload).subscribe(() => {
      console.log('Truck updated');
      this.dialog.close(true); 
    });

    return; // do not run create logic
  }

  // ---------- ADD MODE ----
  const createTruckWithOperator = (operatorId: number) => {
    const formData = {
      truck_type: this.selectedTruck_type,
      carrier: this.selectedCarrier,
      truck_number: this.selectedTruck_number,
      license_plate: this.selectedLicense_plate,
      plate_expiry_date: this.selectedPlate_expiry_date,
      market: [this.selectedMarket],
      operator: operatorId,
    };

    this.truckService.createTruck(formData).subscribe((res) => {
      console.log('Truck created:', res);
      this.dialog.close(res);
    });
  };

  if (this.creatingNewOperator) {
    this.operatorService
      .createOperator({
        name: this.newOperatorName,
        operator_type: this.newOperatorType as 'MTO' | 'ITO',
      })
      .subscribe((newOp) => {
        createTruckWithOperator(newOp.id);
      });
  } else {
    createTruckWithOperator(parseInt(this.selectedOperatorId, 10));
  }
}
  deleteTruck() {
    if (!this.isEditMode || !this.editingTruckId) {
      return;
    }

    if (!confirm('Are you sure you want to delete this truck?')) {
      return;
    }

    this.truckService.deleteTruck(this.editingTruckId).subscribe(() => {
      console.log('Truck deleted');
      this.dialog.close(true);   // let FleetComponent refresh list
    });
  }


  closepopup() {
    this.dialog.close();
  }
}



