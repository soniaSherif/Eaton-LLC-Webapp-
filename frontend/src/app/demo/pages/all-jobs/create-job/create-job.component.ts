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
    classCodes: new FormArray([]),
    baseRate: new FormControl(''),
    fringeRate: new FormControl(''),
    totalStandardTimeRate: new FormControl(''),
    totalOverTimeRate: new FormControl(''),

    // Job Details  
    jobDescription: new FormControl(''),
    jobNumber: new FormControl(''),
    material: new FormControl(''),
    truckTypes: new FormArray([]),
    
    //truckTypeRate: new FormControl(''),
    invoiceType: new FormControl(''),
    itoMtoRate: new FormControl(''),
    haulRate: new FormControl(''),

    // Job Location Details
    jobDate: new FormControl(''),
    jobStartTime: new FormControl(''),
    

    // Loading and Unloading Details
    loadingAddress: new FormControl(''),

    loadingOption: new FormControl(''),
    logWeight: new FormControl(''),
    ticketNumber: new FormControl(''),
    ticketPhoto: new FormControl(''),
    signature: new FormControl(''),
    trackLoadingTime: new FormControl(''),

    // Unloading options
    unloadingAddress: new FormControl(''),
    unloadLogWeight: new FormControl(''),
    unloadTicketNumber: new FormControl(''),
    unloadTicketPhoto: new FormControl(''),
    unloadSignature: new FormControl(''),

    backhaulOption: new FormControl(''),
    jobPhaseForeman: new FormControl(''),    
    additionalNotes: new FormControl('')
  });

  

  isOtherContractor: boolean = false;
  isOtherContractorProjectNumber: boolean = false;
  isPrevailing: boolean = false;
  isNonPrevailing: boolean = false;
  availableTruckTypes: string[] = ['Belly', 'Side', 'End', 'Quint', 'Quad', 'Tri'];

  loadingOptions = [
    { label: 'Log Weight', controlName: 'logWeight' },
    { label: 'Ticket Number', controlName: 'ticketNumber' },
    { label: 'Ticket Photo', controlName: 'ticketPhoto' },
    { label: 'Signature', controlName: 'signature' },
    { label: 'Track Loading Time', controlName: 'trackLoadingTime' }
  ];

  unloadingOptions = [
    { label: 'Log Weight', controlName: 'unloadLogWeight' },
    { label: 'Ticket Number', controlName: 'unloadTicketNumber' },
    { label: 'Ticket Photo', controlName: 'unloadTicketPhoto' },
    { label: 'Signature', controlName: 'unloadSignature' }
  ];


  // Getter for the truckTypes FormArray
  get truckTypes(): FormArray {
    return this.jobForm.get('truckTypes') as FormArray;
  }

  // Getter for the classCodes FormArray
  get classCodes(): FormArray {
    return this.jobForm.get('classCodes') as FormArray;
  }

  addClassCode(code: string) {
    this.classCodes.push(new FormGroup({
      laborCode: new FormControl(code), // Pre-filled like 602, 604, 607
      baseRate: new FormControl(''),
      fringeRate: new FormControl(''),
      totalStandardTimeRate: new FormControl(''),
      totalOverTimeRate: new FormControl('')
    }));
  }

  onTruckTypeChange(event: any) {
    const selectedTypes = this.truckTypes;
  
    if (event.target.checked) {
      selectedTypes.push(new FormGroup({
        type: new FormControl(event.target.value),
        rate: new FormControl(''),
        unit: new FormControl('')
      }));
    } else {
      const index = selectedTypes.controls.findIndex(
        (group: any) => group.value.type === event.target.value
      );
      selectedTypes.removeAt(index);
    }
  }


  /*onTruckTypeChange(event: any) {
    const selectedTypes = this.jobForm.get('truckTypes') as FormArray;
  
    if (event.target.checked) {
      selectedTypes.push(new FormControl(event.target.value));
    } else {
      const index = selectedTypes.controls.findIndex(x => x.value === event.target.value);
      selectedTypes.removeAt(index);
    }
  }
    */


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

      if (this.isPrevailing && this.classCodes.length == 0) {
        ['602', '604', '607'].forEach(code => this.addClassCode(code));
      }
    });
    


  }

  submitJob() {
    console.log('Job Submitted:', this.jobForm.value);
    // TODO: Add API call to submit the form data to the database
  }
}