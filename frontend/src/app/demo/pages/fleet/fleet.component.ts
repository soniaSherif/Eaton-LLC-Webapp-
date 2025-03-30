import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { TruckdialogComponent } from './truckdialog/truckdialog.component';
import { DriverdialogComponent } from './driverdialog/driverdialog.component';

import { TruckService } from 'src/app/services/truck.service';
import { DriverService } from 'src/app/services/driver.service';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.scss']
})
export class FleetComponent implements OnInit {
  selectedTab: 'trucks' | 'drivers' = 'trucks';

  fleetData = {
    trucks: [],
    drivers: []
  };

  constructor(
    public dialog: MatDialog,
    private truckService: TruckService,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.truckService.getAllTrucks().subscribe((trucks: any[]) => {
      this.fleetData.trucks = trucks.map(truck => ({
        ...truck,
        type: truck.truck_type,
        number: truck.truck_number,
        license: truck.license_plate,
        market: truck.market?.[0] || '',
        selected: false
      }));
    });

    this.driverService.getAllDrivers().subscribe((drivers: any[]) => {
      this.fleetData.drivers = drivers.map(driver => ({
        ...driver,
        type: driver.name,
        number: driver.driver_license,
        address: driver.address,
        phone: driver.phone_number,
        selected: false
      }));
    });    
  }

  Openpopup() {
    const dialogRef = this.selectedTab === 'trucks'
      ? this.dialog.open(TruckdialogComponent, { width: '85%', height: 'fit' })
      : this.dialog.open(DriverdialogComponent, { width: '85%', height: '85%' });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchData(); // Refresh data after closing popup
    });
  }

  toggleAllSelection() {
    const items = this.selectedTab === 'trucks' ? this.fleetData.trucks : this.fleetData.drivers;
    const allSelected = items.every(item => item.selected);
    items.forEach(item => item.selected = !allSelected);
  }
}
