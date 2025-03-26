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
  selectedDate: string = new Date().toISOString().split('T')[0]; // Default to current date in yyyy-mm-dd format
  assignments = [
    { job: 'HW72', driver: 'John Doe', truck_type: 'Semi', date: '2025-03-13', selected: false },
    { job: 'I-32', driver: 'Jane Doe', truck_type: 'Belly Dump', date: '2025-06-25', selected: false },
    { job: 'HW73', driver: 'Alice Smith', truck_type: 'Flatbed', date: '2025-03-13', selected: false }
  ];

  filteredAssignments = this.filterAssignmentsByDate(this.selectedDate); // Filter initially by the current date

  constructor(private datePipe: DatePipe, public dialog: MatDialog) {}

  // Open the dispatch dialog
  openDialog(): void {
    this.dialog.open(DispatchDialogComponent, {
      width: '400px'
    });
  }

  // Toggle selection of all assignments
  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.assignments.forEach(customer => customer.selected = checked);
  }

  // Get the formatted date
  getFormattedDate(date: string): string {
    return this.datePipe.transform(date, 'MMMM d, yyyy') || '';
  }

  // Filter assignments based on selected date
  filterAssignments() {
    this.filteredAssignments = this.filterAssignmentsByDate(this.selectedDate);
  }

  // Helper function to filter assignments by date
  filterAssignmentsByDate(date: string) {
    return this.assignments.filter(assignment => assignment.date === date);
  }
}
