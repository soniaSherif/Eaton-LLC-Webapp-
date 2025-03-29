import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule } from '@angular/forms';
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
    numberTruckType: new FormControl(''),
    truckTypes: new FormArray([]),
    truckTypeRate: new FormControl(''),
    invoiceType: new FormControl(''),
    itoMtoRate: new FormControl(''),
    haulRate: new FormControl(''),

    // Job Location Details
    jobDate: new FormControl(''),
    jobStartTime: new FormControl(''),
    

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
  isPrevailing: boolean = false;
  isNonPrevailing: boolean = false;

  // Getter for the truckTypes FormArray
  get truckTypes(): FormArray {
    return this.jobForm.get('truckTypes') as FormArray;
  }

  // Method to dynamically update the truckTypes FormArray
  updateTruckTypes(count: number) {
    const truckTypeForms = this.truckTypes;
    // Remove extra forms if count decreases
    while (truckTypeForms.length > count) {   
      truckTypeForms.removeAt(truckTypeForms.length - 1);
    }
    // Add new forms if count increases
    while (truckTypeForms.length < count) {  
      truckTypeForms.push(new FormGroup({
        truckTypeName: new FormControl(''),
        trucksNeeded: new FormControl(''), // Added field for trucks needed per truck type
        truckRate: new FormControl('')

      }));
    }
  }
  
  constructor(private router: Router) {
    // Listen for changes in the contractorInvoice dropdown
    this.jobForm.get('contractorInvoice')?.valueChanges.subscribe((value) => {
      this.isOtherContractor = value === 'other'; // Show new contractor input if "Other" is selected
    });
    this.jobForm.get('contractorInvoiceProjectNumber')?.valueChanges.subscribe((value) => {
      this.isOtherContractorProjectNumber = value === 'other'; // Show new contractor number input if "Other" is selected
    });
    this.jobForm.get('prevailingOrNot')?.valueChanges.subscribe((value) => {
      this.isNonPrevailing = value === 'nonPrevailing'; // Show new SAP or SP number input if "Non-Prevailing" is selected
      this.isPrevailing = value === 'prevailing'; 
    });

    // Listen for changes in trucksNeeded and dynamically update truckTypes
    this.jobForm.get('numberTruckType')?.valueChanges.subscribe((value) => {
      this.updateTruckTypes(Number(value)); // Ensure value is treated as a number
    });
  }

  submitJob() {
    console.log('Job Submitted:', this.jobForm.value);
    // TODO: Add API call to submit the form data to the database
  }
}