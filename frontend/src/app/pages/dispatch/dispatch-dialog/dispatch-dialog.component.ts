import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dispatch-dialog',
  templateUrl: './dispatch-dialog.component.html',
  styleUrls: ['./dispatch-dialog.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule], // Add FormsModule here
  providers: [DatePipe] // Inject DatePipe to format date
})
export class DispatchDialogComponent {
  constructor(public dialogRef: MatDialogRef<DispatchDialogComponent>, private datePipe: DatePipe) {}

  selectedJob: any = null; // Ensure it's initialized as null to avoid null reference errors
  selectedDriver: string = '';
  selectedTruck: string = '';
  selectedTime: string = ''; // Store only the time

  jobs = [
    { jobName: 'Job 1', jobNumber: 'HW72', date: '2025-03-13' },
    { jobName: 'Job 2', jobNumber: 'I-32', date: '2025-06-25' },
    { jobName: 'Job 3', jobNumber: 'HW73', date: '2025-03-13' }
  ];
  drivers = ['Driver 1', 'Driver 2', 'Driver 3'];
  trucks = ['Truck 1', 'Truck 2', 'Truck 3'];

  ngOnInit() {
    // Initialize with hardcoded data for now
  }

  // Close the dialog
  closeDialog(): void {
    this.dialogRef.close();
  }

  // Submit the form
  submitForm(): void {
    const formData = {
      job: this.selectedJob,
      driver: this.selectedDriver,
      truck: this.selectedTruck,
      time: this.selectedTime // Use time instead of date
    };

    console.log('Form Submitted:', formData);

    // Close the dialog after submitting
    this.dialogRef.close(formData);
  }

  // Get the formatted date for the selected job
  getJobDate(): string {
    if (this.selectedJob && this.selectedJob.date) {
      return this.datePipe.transform(this.selectedJob.date, 'MMMM d, yyyy') || '';
    }
    return ''; // Return an empty string if no job is selected or if the date is not set
  }
}
