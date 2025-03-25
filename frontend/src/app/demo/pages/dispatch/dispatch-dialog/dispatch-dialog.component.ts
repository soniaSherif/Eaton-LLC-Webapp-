import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dispatch-dialog',
  templateUrl: './dispatch-dialog.component.html',
  styleUrls: ['./dispatch-dialog.component.scss']
})
export class DispatchDialogComponent {
  constructor(public dialogRef: MatDialogRef<DispatchDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}