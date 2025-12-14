import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { DispatchAssignmentStorageService } from '../../../services/dispatch-assignment-storage.service';

@Component({
  selector: 'app-edit-dispatch-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './edit-dispatch-assignment.component.html',
  styleUrl: './edit-dispatch-assignment.component.scss'
})
export class EditDispatchAssignmentComponent implements OnInit {
  assignmentId: number | null = null;
  assignmentForm = new FormGroup({
    job: new FormControl('', Validators.required),
    driver: new FormControl('', Validators.required),
    truck_type: new FormControl('', Validators.required),
    jobDate: new FormControl('', Validators.required),
    time: new FormControl('', Validators.required),
  });
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
      // Convert time from "10:30" format to "HH:mm" for time input
      const timeParts = found.time.split(':');
      const timeForInput = `${timeParts[0]}:${timeParts[1]}`;
      
      this.assignmentForm.patchValue({
        job: found.job,
        driver: found.driver,
        truck_type: found.truck_type,
        jobDate: found.jobDate,
        time: timeForInput,
      });
    } else {
      this.error = 'Assignment not found.';
      setTimeout(() => {
        this.router.navigate(['/dispatch']);
      }, 2000);
    }
    this.loading = false;
  }

  submitForm(): void {
    if (this.assignmentForm.invalid || !this.assignmentId) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    // Get form values
    const formValue = this.assignmentForm.getRawValue();
    // Convert time back to "HH:mm" format if needed
    const timeValue = formValue.time || '';
    const timeParts = timeValue.split(':');
    const timeFormatted = `${timeParts[0]}:${timeParts[1] || '00'}`;

    // Update assignment in service
    this.storageService.updateAssignment(this.assignmentId, {
      job: formValue.job || '',
      driver: formValue.driver || '',
      truck_type: formValue.truck_type || '',
      jobDate: formValue.jobDate || '',
      time: timeFormatted
    });

    Swal.fire({
      icon: 'success',
      title: 'Assignment Updated',
      text: 'Assignment has been successfully updated 🎉',
      toast: true,
      position: 'bottom-end',
      timer: 3000,
      showConfirmButton: false
    });

    // Get the date from query params to preserve it
    const date = this.route.snapshot.queryParams['date'];
    if (date) {
      this.router.navigate(['/dispatch'], { queryParams: { date } });
    } else {
      this.router.navigate(['/dispatch']);
    }
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
}

