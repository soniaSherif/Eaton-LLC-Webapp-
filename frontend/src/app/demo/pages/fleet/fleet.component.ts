import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel

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
}
