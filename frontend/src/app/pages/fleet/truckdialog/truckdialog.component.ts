import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TruckService } from 'src/app/services/truck.service';
import { OperatorService } from 'src/app/services/operator.service';

@Component({
  selector: 'app-truckdialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './truckdialog.component.html',
  styleUrl: './truckdialog.component.scss',
})
export class TruckdialogComponent {
  constructor(
    public dialog: MatDialogRef<TruckdialogComponent>,
    private truckService: TruckService,
    private operatorService: OperatorService
  ) {}

  // Form inputs
  selectedTruck_type = '';
  selectedCarrier = '';
  selectedTruck_number = '';
  selectedLicense_plate = '';
  selectedMarket = '';
  selectedOperatorId = '';

  // Logic to switch between create/select
  creatingNewOperator = false;
  newOperatorName = '';
  newOperatorType = 'ITO';

  truckType: string[] = [];
  carrier: string[] = [];
  market: string[] = [];
  operatorList: any[] = [];

  ngOnInit() {
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
    const createTruckWithOperator = (operatorId: number) => {
      const formData = {
        truck_type: this.selectedTruck_type,
        carrier: this.selectedCarrier,
        truck_number: this.selectedTruck_number,
        license_plate: this.selectedLicense_plate,
        market: [this.selectedMarket],
        operator: operatorId
      };

      this.truckService.createTruck(formData).subscribe((res) => {
        console.log('Truck created:', res);
        this.dialog.close(res);
      });
    };

    if (this.creatingNewOperator) {
      this.operatorService.createOperator({
        name: this.newOperatorName,
        operator_type: this.newOperatorType as "MTO" | "ITO"
      }).subscribe((newOp) => {
        createTruckWithOperator(newOp.id);
      });
    } else {
      createTruckWithOperator(parseInt(this.selectedOperatorId));
    }
  }

  closepopup() {
    this.dialog.close();
  }
}



