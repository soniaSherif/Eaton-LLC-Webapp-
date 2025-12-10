import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DispatchDialogComponent } from './dispatch-dialog/dispatch-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DispatchAssignmentStorageService, AssignmentData } from '../../services/dispatch-assignment-storage.service';
import { Subscription, filter } from 'rxjs';

type AssignmentRow = AssignmentData;

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
  private subscription?: Subscription;

  // Filter state
  filters = {
    search: '' // Search by job, driver, or truck type
  };

  constructor(
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: DispatchAssignmentStorageService
  ) {
    // Initialize with the current date in 'yyyy-MM-dd' format
    this.selectedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    // Load assignments from service
    this.loadAssignments();
    
    // Subscribe to assignment updates
    this.subscription = this.storageService.assignments$.subscribe(() => {
      this.loadAssignments();
    });

    // Check for date query parameter to restore previous selection
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.selectedDate = params['date'];
      }
      // Filter assignments by the selected date
      this.filteredAssignments = this.filterAssignmentsByDate(this.selectedDate);
    });

    // Reload when returning to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url === '/dispatch' || this.router.url.startsWith('/dispatch?')) {
        this.loadAssignments();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadAssignments(): void {
    this.assignments = this.storageService.getAllAssignments().map(a => ({ ...a, selected: false }));
    this.applyFilters();
  }

  openDialog(): void {
    this.dialog.open(DispatchDialogComponent, {
      width: '400px'
    });
  }

  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.assignments.forEach(assignment => assignment.selected = checked);
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

  // View assignment
  view(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/dispatch/view', id], {
        queryParams: { date: this.selectedDate }
      });
    }
  }

  // Edit assignment
  edit(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/dispatch/edit', id], {
        queryParams: { date: this.selectedDate }
      });
    }
  }

  // Delete single assignment
  delete(id: number | undefined): void {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this dispatch assignment?')) return;
    
    // Delete from service
    this.storageService.deleteAssignment(id);
    // loadAssignments will be called automatically via subscription
  }

  // Bulk delete
  deleteSelected(): void {
    if (!this.selected.length) return;
    if (!confirm(`Are you sure you want to delete ${this.selected.length} selected assignment(s)?`)) return;
    
    const ids = this.selected.map(s => s.id).filter(id => id !== undefined) as number[];
    // Delete from service
    this.storageService.deleteAssignments(ids);
    // loadAssignments will be called automatically via subscription
  }
}
