import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-driver-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-edit-dialog.component.html',
  styleUrls: ['./driver-edit-dialog.component.scss']
})
export class DriverEditDialogComponent {
  // local copy so we don't mutate the table row directly
  edited = {
    name: '',
    driver_license: '',
    phone_number: '',
    address: '',
    license_expiry_date: '',
    medical_card_expiry_date: ''
  };

  constructor(
    public dialogRef: MatDialogRef<DriverEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { driver: any }
  ) {
    const d = data.driver || {};
    this.edited.name = d.type || d.name || '';
    this.edited.driver_license = d.number || d.driver_license || '';
    this.edited.phone_number = d.phone || d.phone_number || '';
    this.edited.address = d.address || '';
    this.edited.license_expiry_date = d.license_expiry_date || '';
    this.edited.medical_card_expiry_date = d.medical_expiry_date || d.medical_card_expiry_date || '';
  }

  save() {
    // send edited values back to the caller (FleetComponent)
    this.dialogRef.close(this.edited);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
