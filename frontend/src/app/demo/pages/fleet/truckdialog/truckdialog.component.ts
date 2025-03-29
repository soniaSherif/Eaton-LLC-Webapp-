import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-truckdialog',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './truckdialog.component.html',
  styleUrl: './truckdialog.component.scss',
})


export class TruckdialogComponent{
  
  constructor(public dialog:MatDialogRef<TruckdialogComponent>)
  { 
  }

  selectedTruck_type: string ='';
  selectedCarrier: string ='';
  selectedTruck_number: string ='';
  selectedLicense_number: string ='';
  selectedMarket: string = '';
  
  truckType = [];
  carrier =[];
  truckNumber =[];
  licenseNumber =[];
  market =[];

  ngOnInit() { 
    this.truckType = [
      '10 Wheeler',
      '10 Wheeler Live Floor',
      '10 Wheeler (Rough)',
      '3-Eixos',
      '4-Eixos',
    ];
    this.carrier = [
      'M Eaton Trucking'
    ]; 
    this.truckNumber =[];
    this.licenseNumber =[];
    this.market = ['Company Driver', 'Prevailing', 'Proechel Trucking']
    
  }

  closepopup()
  { 
    this.dialog.close()
  };
  
  submitForm(): void {

    const formData = { 
        truck_id: '',
        truckType: this.selectedTruck_type,
        carrier: this.selectedCarrier,
        truckNumber: this.selectedTruck_number,
        licenseNumber: this.selectedLicense_number,
        market: this.selectedMarket,
        created_at: new Date()
      };
      console.log('Form Submitted:', formData)
      this.dialog.close(formData);
    };


}
