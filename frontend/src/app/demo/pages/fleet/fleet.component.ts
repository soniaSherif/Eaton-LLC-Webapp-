import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { TruckdialogComponent } from './truckdialog/truckdialog.component'; // import truck dialog form
import { DriverdialogComponent } from './driverdialog/driverdialog.component'; //import driver dialog form
import { MatDialog} from '@angular/material/dialog' //import mat dialog 
@Component({
  selector: 'app-fleet',
  standalone: true,  // Ensure standalone component supports imports
  imports: [CommonModule, FormsModule],  // Add required modules
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.scss']
})

export class FleetComponent {
  selectedTab: 'trucks' | 'drivers' = 'trucks';

  fleetData = {
    trucks: [
      { type: 'Semi', number: '1234 M Eaton', license: 'xxxxx', market: 'Company Driver', selected: false },
      { type: 'Dump Truck', number: '5678 X Pro', license: 'ABCD123', market: 'Independent', selected: false },
      { type: 'Flatbed', number: '9999 Z Road', license: 'EFGH789', market: 'Company Driver', selected: false }
    ],
    drivers: [
      { type: 'John Doe', number: 'D12345', license: 'XYZ789', market: 'Independent', selected: false },
      { type: 'Jane Smith', number: 'D67890', license: 'LMN456', market: 'Company Driver', selected: false }
    ]
  };

  addFleetItem() {
    console.log(this.selectedTab === 'trucks' ? 'Adding a new Truck' : 'Adding a new Driver');
  }

  toggleAllSelection() {
    const items = this.selectedTab === 'trucks' ? this.fleetData.trucks : this.fleetData.drivers;
    const allSelected = items.every(item => item.selected);
    items.forEach(item => item.selected = !allSelected);
  }
  constructor(public dialog:MatDialog){ 

  }

  Openpopup() { 
    if (this.selectedTab === 'trucks') {
      this.dialog.open(TruckdialogComponent, { width: '85%', height: 'fit' });
    } else {
      this.dialog.open(DriverdialogComponent, { width: '85%', height: '85%'});
    }
    
  }
 
  
}
