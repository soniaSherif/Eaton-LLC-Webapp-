import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DispatchDialogComponent } from './dispatch-dialog/dispatch-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

interface AssignmentRow {
  job?: string;
  driver?: string;
  truck_type?: string;
  jobDate: string;
  time: string;
  selected?: boolean;
}

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe]
})
export class DispatchComponent implements OnInit, OnDestroy {
  selectedDate: string; // Stores the selected date
  assignments: AssignmentRow[] = [];
  filteredAssignments: AssignmentRow[] = [];
  selected: AssignmentRow[] = [];

  // Filter state
  filters = {
    search: '' // Search by job, driver, or truck type
  };

  constructor(
    private datePipe: DatePipe,
    public dialog: MatDialog
  ) {
    // Initialize with the current date in 'yyyy-MM-dd' format
    this.selectedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    // Load assignments from local store (replace with real data source when available)
    this.loadAssignments();
  }

  ngOnDestroy(): void {
    // No subscriptions to clean up currently
  }

  loadAssignments(): void {
    this.assignments = [
      {
        job: 'Demo Job 1',
        driver: 'Driver A',
        truck_type: 'Flatbed',
        jobDate: this.selectedDate,
        time: '09:00'
      },
      {
        job: 'Demo Job 2',
        driver: 'Driver B',
        truck_type: 'Tanker',
        jobDate: this.selectedDate,
        time: '13:30'
      }
    ].map(a => ({ ...a, selected: false }));
    this.applyFilters();
  }

  openDialog(): void {
    this.dialog.open(DispatchDialogComponent, {
      width: '400px'
    });
  }

  toggleAllSelection(event: any) {
    const checked = (event.target as HTMLInputElement).checked;
    this.assignments.forEach(assignment => assignment.selected = checked);
    this.onSelect();
  }

  getFormattedDate(date: string): string {
    return this.datePipe.transform(date, 'MMMM d, yyyy') || '';
  }

  getFormattedTime(time: string): string {
    const hours = parseInt(time.split(':')[0], 10);
    const minutes = time.split(':')[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
  }

  filterAssignments() {
    this.applyFilters();
  }

  // Apply both date and search filters
  applyFilters(): void {
    const searchTerm = this.filters.search.toLowerCase().trim();
    let filtered = this.assignments;

    // Apply date filter first (original functionality - DO NOT TOUCH)
    filtered = this.filterAssignmentsByDate(this.selectedDate);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment => {
        const matchesJob = assignment.job?.toLowerCase().includes(searchTerm) || false;
        const matchesDriver = assignment.driver?.toLowerCase().includes(searchTerm) || false;
        const matchesTruck = assignment.truck_type?.toLowerCase().includes(searchTerm) || false;
        return matchesJob || matchesDriver || matchesTruck;
      });
    }

    this.filteredAssignments = filtered;
    this.onSelect();
  }

  filterAssignmentsByDate(date: string) {
    return this.assignments.filter(assignment => assignment.jobDate === date);
  }

  onSelect(): void {
    this.selected = this.filteredAssignments.filter(a => a.selected);
  }
}