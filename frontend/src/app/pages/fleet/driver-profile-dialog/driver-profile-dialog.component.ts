import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-driver-profile-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-profile-dialog.component.html',
  styleUrls: ['./driver-profile-dialog.component.scss']
})
export class DriverProfileDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DriverProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { driver: any }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
