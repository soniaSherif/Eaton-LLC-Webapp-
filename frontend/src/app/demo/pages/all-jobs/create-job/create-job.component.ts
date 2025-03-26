import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
//import { tick } from '@angular/core/testing';
//import { sign } from 'crypto';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent {
  jobForm = new FormGroup({
    // Project Details
    project: new FormControl(''),
    primeContractor: new FormControl(''),
    primeContractorProjectNumber: new FormControl(''),
    contractorInvoice: new FormControl(''),
    newContractorInvoice: new FormControl(''), // For the "Other" option
    contractorInvoiceProjectNumber: new FormControl(''),
    newContractorInvoiceProjectNumber: new FormControl(''), // For the "Other" option
    prevailingOrNot: new FormControl(''),
    sapOrSpNumber: new FormControl(''),
    reportRequirement: new FormControl(''),
    contractNumber: new FormControl(''),
    projectId: new FormControl(''),
    classCode: new FormControl(''),
    baseRate: new FormControl(''),
    fringeRate: new FormControl(''),
    totalStandardTimeRate: new FormControl(''),
    totalOverTimeRate: new FormControl(''),

    // Job Details  
    jobDescription: new FormControl(''),
    jobNumber: new FormControl(''),
    material: new FormControl(''),
    rate: new FormControl(''),
    invoiceType: new FormControl(''),
    truckTypes: new FormControl(''),
    haulRate: new FormControl(''),
    itoMtoRate: new FormControl(''),
    jobDate: new FormControl(''),
    jobStartTime: new FormControl(''),
    trucksNeeded: new FormControl(''),

    // Loading and Unloading Details
    loadingAddress: new FormControl(''),
    logWeight: new FormControl(''),
    ticketNumber: new FormControl(''),
    ticketPhoto: new FormControl(''),
    signature: new FormControl(''),
    trackLoadingTime: new FormControl(''),
    unloadingAddress: new FormControl(''),
    backhaulOption: new FormControl(''),
    jobPhaseForeman: new FormControl(''),    
    additionalNotes: new FormControl('')
  });

  isOtherContractor: boolean = false;
  isOtherContractorProjectNumber: boolean = false;

  constructor(private router: Router) {
    // Listen for changes in the contractorInvoice dropdown
    this.jobForm.get('contractorInvoice')?.valueChanges.subscribe((value) => {
      this.isOtherContractor = value === 'other'; // Show new contractor input if "Other" is selected
    });
    this.jobForm.get('contractorInvoiceProjectNumber')?.valueChanges.subscribe((value) => {
      this.isOtherContractorProjectNumber = value === 'other'; // Show new contractor number input if "Other" is selected
    });
  }

  submitJob() {
    console.log('Job Submitted:', this.jobForm.value);
    // TODO: Add API call to submit the form data to the database
  }
}
