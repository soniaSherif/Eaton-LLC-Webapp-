import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent {
  jobForm = new FormGroup({
    project: new FormControl(''),
    customer: new FormControl(''),
    jobTitle: new FormControl(''),
    poNumber: new FormControl(''),
    jobNumber: new FormControl(''),
    orderNumber: new FormControl(''),
    markets: new FormControl(''),
    material: new FormControl(''),
    phaseCode: new FormControl(''),
    invoiceType: new FormControl(''),
    rate: new FormControl(''),
    haulRate: new FormControl(''),
    totalAmount: new FormControl(''),
    dateRange: new FormControl(''),
    shiftStart: new FormControl(''),
    shiftEnd: new FormControl(''),
    yardBufferTime: new FormControl(''),
    trucksNeeded: new FormControl(''),
    truckTypes: new FormControl(''),
    dailyTarget: new FormControl(''),
    staggerStartTime: new FormControl(''),
    loadingAddress: new FormControl(''),
    unloadingAddress: new FormControl(''),
    additionalNotes: new FormControl('')
  });

  constructor(private router: Router) {}

  submitJob() {
    console.log('Job Submitted:', this.jobForm.value);
    // TODO: Add API call to submit the form data to the database
  }
}
