import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
//import { tick } from '@angular/core/testing';
//import { sign } from 'crypto';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CdkStepperModule, NgStepperModule],
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
    

    // Loading options
    loadingAddresses: new FormControl(''),
    backhaulLoadingAddresses: new FormControl(''),
    loadingOption: new FormControl(''),
    logWeight: new FormControl(''),
    ticketNumber: new FormControl(''),
    ticketPhoto: new FormControl(''),
    signature: new FormControl(''),
    trackLoadingTime: new FormControl(''),

    // Unloading options
    unloadingAddresses: new FormControl(''),
    backhaulUnloadingAddresses: new FormControl(''),
    unloadLogWeight: new FormControl(''),
    unloadTicketNumber: new FormControl(''),
    unloadTicketPhoto: new FormControl(''),
    unloadSignature: new FormControl(''),

    // Loading address details
    loadingCity: new FormControl(''),
    loadingZipCode: new FormControl(''),
    loadingLocationName: new FormControl(''),
    loadingLatitude: new FormControl(''),
    loadingLongitude: new FormControl(''),

     // Unloading address details
    unloadingCity: new FormControl(''),
    unloadingZipCode: new FormControl(''),
    unloadingLocationName: new FormControl(''),
    unloadingLatitude: new FormControl(''),
    unloadingLongitude: new FormControl(''),

    isBackhaulEnabled: new FormControl(false),
    backhaulOption: new FormControl(''),
    jobForemanName: new FormControl(''), 
    jobForemanContact: new FormControl(''),      
    additionalNotes: new FormControl('')
  });

  

  isOtherContractor: boolean = false;
  isOtherContractorProjectNumber: boolean = false;
  isPrevailing: boolean = false;
  isNonPrevailing: boolean = false;
  availableTruckTypes: string[] = ['Belly', 'Side', 'End', 'Quint', 'Quad', 'Tri'];

  // Dropdown options for addresses (will show in the dropdown)
  loadingAddressOptions: string[] = [];
  unloadingAddressOptions: string[] = [];
  backhaulLoadingAddressOptions: string[] = [];
  backhaulUnloadingAddressOptions: string[] = [];

  // Bools for if add new address button is clicked
  showNewLoadingAddress: boolean = false;
  showNewUnloadingAddress: boolean = false;

  // Temporarily hold new address
  newLoadingAddress: string = '';
  newUnloadingAddress: string = '';
  newBackhaulLoadingAddress: string = '';
  newBackhaulUnloadingAddress: string = '';

  countryOptions: string[] = ['United States'];
  stateOptions: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  
  // Temporary values for country and state, city, etc.
  loadingCountry: string = 'United States';
  loadingState: string = '';
  loadingCity: string = '';
  loadingZipCode: string = '';
  loadingLocationName: string = '';
  loadingLatitude: string = '';
  loadingLongitude: string = '';
  loadingLocationType: string = '';

  unloadingCountry: string = 'United States';
  unloadingState: string = '';
  unloadingCity: string = '';
  unloadingZipCode: string = '';
  unloadingLocationName: string = '';
  unloadingLatitude: string = '';
  unloadingLongitude: string = '';
  unloadingLocationType: string = '';

  locationTypeOptions: string[] = [
    'Building Material',
    'Cement',
    'Distrubution Center',
    'Job Site',
    'Landfill',
    'Mine',
    'Not Set',
    'Plant',
    'Quarry',
    'Yard'
  ];

   // Backhaul address options
  showNewBackhaulLoadingAddress: boolean = false;
  showNewBackhaulUnloadingAddress: boolean = false;
  backhaulLoadingAddress: string = '';
  backhaulLoadingCountry: string = 'United States';
  backhaulLoadingState: string = '';
  backhaulLoadingCity: string = '';
  backhaulLoadingZipCode: string = '';
  backhaulLoadingLocationName: string = '';
  backhaulLoadingLatitude: string = '';
  backhaulLoadingLongitude: string = '';
  backhaulLoadingLocationType: string = '';

  backhaulUnloadingAddress: string = '';
  backhaulUnloadingCountry: string = 'United States';
  backhaulUnloadingState: string = '';
  backhaulUnloadingCity: string = '';
  backhaulUnloadingZipCode: string = '';
  backhaulUnloadingLocationName: string = '';
  backhaulUnloadingLatitude: string = '';
  backhaulUnloadingLongitude: string = '';
  backhaulUnloadingLocationType: string = '';

  addLoadingAddress() {
    if (this.newLoadingAddress.trim()) {
      const fullAddress = `${this.newLoadingAddress.trim()}, ${this.loadingCity}, ${this.loadingState}, ${this.loadingZipCode}, ${this.loadingCountry}, ${this.loadingLocationName}, ${this.loadingLatitude}, ${this.loadingLongitude}, ${this.loadingLocationType}`;
      
      // Push the combined string into the array
      this.loadingAddressOptions.push(fullAddress);
      this.jobForm.get('loadingAddresses')?.setValue(fullAddress);
      
      // Reset the fields
      this.newLoadingAddress = '';
      this.loadingCity = '';
      this.loadingState = '';
      this.loadingZipCode = '';
      this.loadingCountry = 'United States'; 
      this.loadingLocationType = '';
      this.loadingLocationName = '';
      this.loadingLatitude = '';
      this.loadingLongitude = '';
      this.showNewLoadingAddress = false;
    }
  }
  
  // Method to add a new unloading address
  addUnloadingAddress() {
    if (this.newUnloadingAddress.trim()) {
      const fullAddress = `${this.newUnloadingAddress.trim()}, ${this.unloadingCity}, ${this.unloadingState}, ${this.unloadingZipCode}, ${this.unloadingCountry}, ${this.unloadingLocationName}, ${this.unloadingLatitude}, ${this.unloadingLongitude}, ${this.unloadingLocationType}`;
    
      // Push the combined string into the array
      this.unloadingAddressOptions.push(fullAddress);
      this.jobForm.get('unloadingAddresses')?.setValue(fullAddress);
    
      // Reset fields
      this.newUnloadingAddress = '';
      this.unloadingCity = '';
      this.unloadingZipCode = '';
      this.unloadingLocationName = '';
      this.unloadingLatitude = '';
      this.unloadingLongitude = '';
      this.unloadingLocationType = '';
      this.unloadingState = '';
      this.unloadingCountry = 'United States';
      this.showNewUnloadingAddress = false;
    }
  }

  addBackhaulLoadingAddress() {
    if (this.newBackhaulLoadingAddress.trim()) {
      const fullAddress = `${this.newBackhaulLoadingAddress.trim()}, ${this.backhaulLoadingCity}, ${this.backhaulLoadingState}, ${this.backhaulLoadingZipCode}, ${this.backhaulLoadingCountry}, ${this.backhaulLoadingLocationName}, ${this.backhaulLoadingLatitude}, ${this.backhaulLoadingLongitude}, ${this.backhaulLoadingLocationType}`;
  
      // Push the combined string into the array
      this.backhaulLoadingAddressOptions.push(fullAddress);
      this.jobForm.get('backhaulLoadingAddresses')?.setValue(fullAddress);
  
      // Reset the fields
      this.newBackhaulLoadingAddress = '';
      this.backhaulLoadingCity = '';
      this.backhaulLoadingState = '';
      this.backhaulLoadingZipCode = '';
      this.backhaulLoadingCountry = 'United States';
      this.backhaulLoadingLocationName = '';
      this.backhaulLoadingLatitude = '';
      this.backhaulLoadingLongitude = '';
      this.backhaulLoadingLocationType = '';
      this.showNewBackhaulLoadingAddress = false;
    }
  }

  addBackhaulUnloadingAddress() {
    if (this.newBackhaulUnloadingAddress.trim()) {
      const fullAddress = `${this.newBackhaulUnloadingAddress.trim()}, ${this.backhaulUnloadingCity}, ${this.backhaulUnloadingState}, ${this.backhaulUnloadingZipCode}, ${this.backhaulUnloadingCountry}, ${this.backhaulUnloadingLocationName}, ${this.backhaulUnloadingLatitude}, ${this.backhaulUnloadingLongitude}, ${this.backhaulUnloadingLocationType}`;
  
      // Push the combined string into the array
      this.backhaulUnloadingAddressOptions.push(fullAddress);
      this.jobForm.get('backhaulUnloadingAddresses')?.setValue(fullAddress);
  
      // Reset the fields
      this.newBackhaulUnloadingAddress = '';
      this.backhaulUnloadingCity = '';
      this.backhaulUnloadingState = '';
      this.backhaulUnloadingZipCode = '';
      this.backhaulUnloadingCountry = 'United States';
      this.backhaulUnloadingLocationName = '';
      this.backhaulUnloadingLatitude = '';
      this.backhaulUnloadingLongitude = '';
      this.backhaulUnloadingLocationType = '';
      this.showNewBackhaulUnloadingAddress = false;
    }
  }


  /* Reset the loading fields after adding or closing
  resetLoadingFields() {
    this.newLoadingAddress = '';
    this.loadingCity = '';
    this.loadingState = '';
    this.loadingZipCode = '';
    this.loadingLocationName = '';
    this.loadingLatitude = '';
    this.loadingLongitude = '';
    this.loadingLocationType = '';
    this.showNewLoadingAddress = false;
  }
  */

  /*
  // Reset the unloading fields after adding or closing
  resetUnloadingFields() {
    this.newUnloadingAddress = '';
    this.unloadingCity = '';
    this.unloadingState = '';
    this.unloadingZipCode = '';
    this.unloadingLocationName = '';
    this.unloadingLatitude = '';
    this.unloadingLongitude = '';
    this.unloadingLocationType = '';
    this.showNewUnloadingAddress = false;
  }
  */

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

  get isBackhaulEnabled(): boolean {
    return this.jobForm.get('isBackhaulEnabled')?.value;
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