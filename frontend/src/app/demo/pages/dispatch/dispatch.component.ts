import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DispatchDialogComponent } from './dispatch-dialog/dispatch-dialog.component';

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchComponent {
  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(DispatchDialogComponent, {
      width: '400px'
    });
  }
}