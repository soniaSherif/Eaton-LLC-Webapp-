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
  selectedDate: string; // Stores the selected date
  assignments = [
    { job: 'HW72', driver: 'John Doe', truck_type: 'Semi', jobDate: '2025-03-13', time: '10:30', selected: false },
    { job: 'I-32', driver: 'Jane Doe', truck_type: 'Belly Dump', jobDate: '2025-06-25', time: '14:00', selected: false },
    { job: 'HW73', driver: 'Alice Smith', truck_type: 'Flatbed', jobDate: '2025-03-13', time: '10:30', selected: false }
  ];

  filteredAssignments: any[] = [];

  constructor(private datePipe: DatePipe, public dialog: MatDialog) {
    // Initialize with the current date in 'yyyy-MM-dd' format
    this.selectedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

    // Initially filter assignments by today's date
    this.filteredAssignments = this.filterAssignmentsByDate(this.selectedDate);
  }

  // Open the dispatch dialog
  openDialog(): void {
    this.dialog.open(DispatchDialogComponent, {
      width: '400px'
    });
  }

  // Toggle selection of all assignments
  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.assignments.forEach(assignment => assignment.selected = checked);
  }

  // Format the job date for user-friendly display
  getFormattedDate(date: string): string {
    return this.datePipe.transform(date, 'MMMM d, yyyy') || '';
  }

  // Format the time in AM/PM format
  getFormattedTime(time: string): string {
    const hours = parseInt(time.split(':')[0], 10);
    const minutes = time.split(':')[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 or 24 hour format to 12-hour format
    return `${formattedHours}:${minutes} ${period}`;
  }

  // Called when user changes the date input; updates the filtered list
  filterAssignments() {
    this.filteredAssignments = this.filterAssignmentsByDate(this.selectedDate);
  }

  // Return only assignments matching the selected date (job date filter)
  filterAssignmentsByDate(date: string) {
    return this.assignments.filter(assignment => assignment.jobDate === date);
  }
}
