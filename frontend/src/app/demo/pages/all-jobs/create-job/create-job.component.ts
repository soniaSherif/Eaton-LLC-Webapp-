import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent {
  currentStep = 1; // Track the current step

  jobData = {
    project: '',
    customer: '',
    jobTitle: '',
    poNumber: '',
    jobNumber: '',
    orderNumber: '',
    markets: '',
    material: '',
    phaseCode: '',
    invoiceType: '',
    rate: '',
    haulRate: '',
    totalAmount: '',
    dateRange: '',
    shiftStart: '',
    shiftEnd: '',
    yardBufferTime: '',
    trucksNeeded: '',
    truckTypes: '',
    dailyTarget: '',
    staggerStartTime: '',
    loadingAddress: '',
    unloadingAddress: '',
    loadingOptions: {},
    unloadingOptions: {},
    additionalNotes: ''
  };

  constructor(private router: Router) {}

  nextStep() {
    if (this.currentStep < 6) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitJob() {
    console.log('Job Submitted:', this.jobData);
    // TODO: Add API call to submit the form data to the database
  }
}
