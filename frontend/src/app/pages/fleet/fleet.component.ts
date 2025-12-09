import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { TruckdialogComponent } from './truckdialog/truckdialog.component';
import { DriverdialogComponent } from './driverdialog/driverdialog.component';

import { TruckService } from 'src/app/services/truck.service';
import { DriverService } from 'src/app/services/driver.service';
import { DriverProfileDialogComponent } from './driver-profile-dialog/driver-profile-dialog.component';
import { TruckProfileDialogComponent } from './truck-profile-dialog/truck-profile-dialog.component';

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
  readonly EXPIRY_THRESHOLD_DAYS = 30; // Expiring Soon if <= 30 days
  searchTerm: string = '';
  // which row's menu is open (by id)
  openMenuId: number | null = null;
private computeExpiryStatus(dateStr?: string | null) {
  if (!dateStr) {
    return {
    expiryDate: null as string | null,
    daysLeft: null as number | null,
    status: 'N/A' as 'N/A' | 'Expired' | 'Expiring Soon' | 'Valid'
    };
  }

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [y, m, d] = dateStr.split('-').map(Number);
  const expiry = new Date(y, (m ?? 1) - 1, d ?? 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.floor((expiry.getTime() - todayDateOnly.getTime()) / msPerDay);

  let status: 'Expired' | 'Expiring Soon' | 'Valid';
  if (daysLeft < 0) status = 'Expired';
  else if (daysLeft <= this.EXPIRY_THRESHOLD_DAYS) status = 'Expiring Soon';
  else status = 'Valid';

  return { expiryDate: dateStr, daysLeft, status };
}

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
    this.fleetData.trucks = trucks.map(truck => {

      // fix date format so <input type="date"> can show it
      const rawPlate = truck.plate_expiry_date;
      const plateDateOnly = rawPlate ? String(rawPlate).slice(0, 10) : null;

      // make market always a simple string
      const marketValue = Array.isArray(truck.market)
        ? (truck.market[0] || '')
        : (truck.market || '');

      const plate = this.computeExpiryStatus(plateDateOnly || undefined);
      return {
        ...truck,
        type: truck.truck_type,
        number: truck.truck_number,
        license: truck.license_plate,
        market: marketValue, 
        plate_expiry_date: plate.expiryDate,
        plate_days_left: plate.daysLeft,
        plate_status: plate.status,
        selected: false
      };
    });
  });
  
  this.driverService.getAllDrivers().subscribe((drivers: any[]) => {
    this.fleetData.drivers = drivers.map(driver => {
      const dl = this.computeExpiryStatus(driver.license_expiry_date);
      const med = this.computeExpiryStatus(driver.medical_card_expiry_date);


      return {
        ...driver,
        type: driver.name,
        number: driver.driver_license,
        address: driver.address,
        phone: driver.phone_number,
        license_expiry_date: dl.expiryDate,
        license_days_left: dl.daysLeft,
        license_status: dl.status,
        // Medical card expiry
        medical_expiry_date: med.expiryDate,
        medical_days_left: med.daysLeft,
        medical_status: med.status,
        
        selected: false
      };
    });
  });    
}

get filteredTrucks() {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.fleetData.trucks;

    return this.fleetData.trucks.filter(t =>
      (t.type || '').toLowerCase().includes(q) ||
      (t.number || '').toLowerCase().includes(q) ||
      (t.license || '').toLowerCase().includes(q) ||
      (t.market || '').toLowerCase().includes(q)
    );
  }

 
  get filteredDrivers() {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.fleetData.drivers;

    return this.fleetData.drivers.filter(d =>
      (d.type || '').toLowerCase().includes(q) ||      // name
      (d.number || '').toLowerCase().includes(q) ||    // CDL
      (d.address || '').toLowerCase().includes(q) ||
      (d.phone || '').toLowerCase().includes(q)
    );
  }
  
  Openpopup() {
    const dialogRef = this.selectedTab === 'trucks'
      ? this.dialog.open(TruckdialogComponent, { width: '450px', })
      : this.dialog.open(DriverdialogComponent, { width: '475px', height: '85%' });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchData(); // Refresh data after closing popup
    });
  }

  toggleAllSelection() {
    const items = this.selectedTab === 'trucks' ? this.fleetData.trucks : this.fleetData.drivers;
    const allSelected = items.every(item => item.selected);
    items.forEach(item => item.selected = !allSelected);
  }
  toggleRowMenu(item: any) {
  this.openMenuId = this.openMenuId === item.id ? null : item.id;
}

  closeRowMenu() {
    this.openMenuId = null;
  }

  // wrapper methods so we can close menu after action
  onEditDriverClick(driver: any) {
    this.closeRowMenu();
    this.editDriver(driver);
  }

  onViewDriverProfileClick(driver: any) {
    this.closeRowMenu();
    this.viewDriverProfile(driver);
  }

  onEditTruckClick(truck: any) {
    this.closeRowMenu();
    this.editTruck(truck);
  }
  onViewTruckClick(truck: any) {
  this.closeRowMenu();
  this.viewTruckProfile(truck);
}

  viewTruckProfile(truck: any) {
    this.dialog.open(TruckProfileDialogComponent, {
      width: '600px',
      data: { truck }
    });
  }

  onRemoveTruckClick(truck: any) {
    this.closeRowMenu();
    this.removeTruck(truck);
  }

   editDriver(driver: any) {
  const dialogRef = this.dialog.open(DriverdialogComponent, {
    width: '475px',
    height: '85%',
    data: { mode: 'edit', driver }
  });

  dialogRef.afterClosed().subscribe(() => {
    this.fetchData();
  });
}


viewDriverProfile(driver: any) {
  this.dialog.open(DriverProfileDialogComponent, {
    width: '600px',
    data: { driver }
  });
}
editTruck(truck: any) {
  const dialogRef = this.dialog.open(TruckdialogComponent, {
    width: '450px',
    data: { mode: 'edit', truck }
  });

  dialogRef.afterClosed().subscribe(() => {
    this.fetchData();
  });
}


removeTruck(truck: any) {
  if (!confirm('Are you sure you want to remove this truck?')) {
    return;
  }

  this.truckService.deleteTruck(truck.id).subscribe(() => {
    this.fetchData();
  });
}
 
}
