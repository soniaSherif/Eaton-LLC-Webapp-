import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DispatchDialogComponent } from './dispatch-dialog/dispatch-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe]
})
export class DispatchComponent {
  constructor(private datePipe: DatePipe, public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(DispatchDialogComponent, {
      width: '400px'
    });
  }

  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.assignments.forEach(customer => customer.selected = checked);
  }

  getFormattedDate(date: string): string {
    return this.datePipe.transform(date, 'MMMM d, yyyy') || '';
  }

  assignments = [
    { job: 'HW72', driver: 'John Doe', truck_type: 'Semi', date: '2025-03-13', selected: false },
    { job: 'I-32', driver: 'Jane Doe', truck_type: 'Belly Dump', date: '2025-06-25', selected: false }
  ];
}