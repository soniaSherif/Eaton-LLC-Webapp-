import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dispatch-dialog',
  templateUrl: './dispatch-dialog.component.html',
  styleUrls: ['./dispatch-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  providers: [DatePipe]
})
export class DispatchDialogComponent {
  selectedJob: any = null;
  selectedDriver: string = '';
  selectedTruck: string = '';
  selectedDate: string = '';
  selectedTime: string = '';

  jobs = [
    { jobName: 'Job 1', jobNumber: 'HW72', date: '2025-03-13' },
    { jobName: 'Job 2', jobNumber: 'I-32', date: '2025-06-25' },
    { jobName: 'Job 3', jobNumber: 'HW73', date: '2025-03-13' }
  ];
  drivers = ['Driver 1', 'Driver 2', 'Driver 3'];
  trucks = ['Truck 1', 'Truck 2', 'Truck 3'];

  constructor(
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<DispatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize with current date
    const now = new Date();
    this.selectedDate = data?.selectedDate || this.datePipe.transform(now, 'yyyy-MM-dd') || '';
    this.selectedTime = this.datePipe.transform(now, 'HH:mm') || '';
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
      date: this.selectedDate,
      time: this.selectedTime
    };

    console.log('Form Submitted:', formData);
    this.dialogRef.close(formData);
  }

  // Get the formatted date for the selected job
  getJobDate(): string {
    if (this.selectedJob && this.selectedJob.date) {
      return this.datePipe.transform(this.selectedJob.date, 'MMMM d, yyyy') || '';
    }
    return '';
  }
}