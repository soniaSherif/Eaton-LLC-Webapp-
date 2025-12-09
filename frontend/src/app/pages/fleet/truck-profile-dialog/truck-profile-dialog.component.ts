import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-truck-profile-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './truck-profile-dialog.component.html',
  styleUrls: ['./truck-profile-dialog.component.scss'],
})
export class TruckProfileDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TruckProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
    get marketDisplay(): string {
        const m = this.data?.truck?.market;

        if (Array.isArray(m)) {
        return m[0] || '';
        }
        return m || '';
    }
  close() {
    this.dialogRef.close();
  }
}

