import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DispatchAssignmentStorageService, AssignmentData } from '../../../services/dispatch-assignment-storage.service';

@Component({
  selector: 'app-view-dispatch-assignment',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './view-dispatch-assignment.component.html',
  styleUrl: './view-dispatch-assignment.component.scss'
})
export class ViewDispatchAssignmentComponent implements OnInit {
  assignmentId: number | null = null;
  assignment: AssignmentData | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private storageService: DispatchAssignmentStorageService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.assignmentId = idParam ? +idParam : null;
    
    if (this.assignmentId) {
      this.loadAssignment(this.assignmentId);
    } else {
      this.router.navigate(['/dispatch']);
    }
  }

  loadAssignment(id: number): void {
    this.loading = true;
    this.error = null;
    
    const found = this.storageService.getAssignmentById(id);
    if (found) {
      this.assignment = found;
    } else {
      this.error = 'Assignment not found.';
      setTimeout(() => {
        this.router.navigate(['/dispatch']);
      }, 2000);
    }
    this.loading = false;
  }

  goBack(): void {
    // Get the date from query params to preserve it
    const date = this.route.snapshot.queryParams['date'];
    if (date) {
      this.router.navigate(['/dispatch'], { queryParams: { date } });
    } else {
      this.router.navigate(['/dispatch']);
    }
  }

  editAssignment(): void {
    if (this.assignmentId) {
      // Preserve the date when navigating to edit
      const date = this.route.snapshot.queryParams['date'];
      if (date) {
        this.router.navigate(['/dispatch/edit', this.assignmentId], { queryParams: { date } });
      } else {
        this.router.navigate(['/dispatch/edit', this.assignmentId]);
      }
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'MMMM d, yyyy') || '';
  }

  formatTime(timeString: string): string {
    const hours = parseInt(timeString.split(':')[0], 10);
    const minutes = timeString.split(':')[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
  }
}

