import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dispatch-dialog',
  templateUrl: './dispatch-dialog.component.html',
  styleUrls: ['./dispatch-dialog.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Add FormsModule here
})
export class DispatchDialogComponent {
  constructor(public dialogRef: MatDialogRef<DispatchDialogComponent>) {}

  selectedJob: string = '';
  selectedDriver: string = '';
  selectedTruck: string = '';
  selectedDate: string = '';

  jobs = [];
  drivers = [];
  trucks = [];

  ngOnInit() {
    // Simulated API calls with hardcoded data
    this.jobs = ['Job 1', 'Job 2', 'Job 3'];
    this.drivers = ['Driver 1', 'Driver 2', 'Driver 3'];
    this.trucks = ['Truck 1', 'Truck 2', 'Truck 3'];
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
      date: this.selectedDate
    };

    console.log('Form Submitted:', formData); // You can replace this with an actual API call or logic.

    // Close the dialog after submitting
    this.dialogRef.close(formData);
  }
}
