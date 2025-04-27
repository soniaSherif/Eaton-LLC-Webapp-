import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { AddressService } from 'src/app/services/address.service';
import { JobService } from 'src/app/services/job.service';
//import { tick } from '@angular/core/testing';
//import { sign } from 'crypto';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})


export class CreateJobComponent implements OnInit {

  jobForm = new FormGroup({
    // Project Details
    project: new FormControl(''),
    primeContractor: new FormControl(''),
    primeContractorProjectNumber: new FormControl(''),
    contractorInvoice: new FormControl(''),
    newContractorInvoice: new FormControl(''),
    contractorInvoiceProjectNumber: new FormControl(''),
    newContractorInvoiceProjectNumber: new FormControl(''),
    prevailingOrNot: new FormControl(''),
    sapOrSpNumber: new FormControl(''),
    reportRequirement: new FormControl(''),
    contractNumber: new FormControl(''),
    projectId: new FormControl(''),
    classCodes: new FormArray([]),
  
    // Prevailing Wage Rate Details
    baseRate: new FormControl(''),
    fringeRate: new FormControl(''),
    totalStandardTimeRate: new FormControl(''),
    totalOverTimeRate: new FormControl(''),
  
    // Job Details
    jobDescription: new FormControl(''),
    jobNumber: new FormControl(''),
    material: new FormControl(''),
    truckTypes: new FormArray([]),
    invoiceType: new FormControl(''),
    itoMtoRate: new FormControl(''),
    haulRate: new FormControl(''),
  
    // Job Schedule
    jobDate: new FormControl(''),
    jobStartTime: new FormControl(''),

     // Loading/Unloading address selections 
  loadingAddress: new FormControl(''),            
  backhaulLoadingAddress: new FormControl(''),    
  unloadingAddress: new FormControl(''),           
  backhaulUnloadingAddress: new FormControl(''),   
  
    // Loading options
    loadingAddresses: new FormControl(''),
    backhaulLoadingAddresses: new FormControl(''),
    loadingOption: new FormControl(''),
    logWeight: new FormControl(''),
    ticketNumber: new FormControl(''),
    ticketPhoto: new FormControl(''),
    signature: new FormControl(''),
    trackLoadingTime: new FormControl(''),
  
    // Loading address fields
    newLoadingAddress: new FormControl(''),
    loadingCountry: new FormControl('United States'),
    loadingState: new FormControl(''),
    loadingCity: new FormControl(''),
    loadingZipCode: new FormControl(''),
    loadingLocationName: new FormControl(''),
    loadingLatitude: new FormControl(''),
    loadingLongitude: new FormControl(''),
    loadingLocationType: new FormControl(''),
  
    // Unloading options
    unloadingAddresses: new FormControl(''),
    backhaulUnloadingAddresses: new FormControl(''),
    unloadLogWeight: new FormControl(''),
    unloadTicketNumber: new FormControl(''),
    unloadTicketPhoto: new FormControl(''),
    unloadSignature: new FormControl(''),
  
    // Unloading address fields
    newUnloadingAddress: new FormControl(''),
    unloadingCountry: new FormControl('United States'),
    unloadingState: new FormControl(''),
    unloadingCity: new FormControl(''),
    unloadingZipCode: new FormControl(''),
    unloadingLocationName: new FormControl(''),
    unloadingLatitude: new FormControl(''),
    unloadingLongitude: new FormControl(''),
    unloadingLocationType: new FormControl(''),
  
    // Backhaul loading address fields
    newBackhaulLoadingAddress: new FormControl(''),
    backhaulLoadingCountry: new FormControl('United States'),
    backhaulLoadingState: new FormControl(''),
    backhaulLoadingCity: new FormControl(''),
    backhaulLoadingZipCode: new FormControl(''),
    backhaulLoadingLocationName: new FormControl(''),
    backhaulLoadingLatitude: new FormControl(''),
    backhaulLoadingLongitude: new FormControl(''),
    backhaulLoadingLocationType: new FormControl(''),
  
    // Backhaul unloading address fields
    newBackhaulUnloadingAddress: new FormControl(''),
    backhaulUnloadingCountry: new FormControl('United States'),
    backhaulUnloadingState: new FormControl(''),
    backhaulUnloadingCity: new FormControl(''),
    backhaulUnloadingZipCode: new FormControl(''),
    backhaulUnloadingLocationName: new FormControl(''),
    backhaulUnloadingLatitude: new FormControl(''),
    backhaulUnloadingLongitude: new FormControl(''),
    backhaulUnloadingLocationType: new FormControl(''),
  
    // Job Management
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
  loadingAddressOptions: any[] = [];
  unloadingAddressOptions: any[] = [];
  backhaulLoadingAddressOptions: any[] = [];
  backhaulUnloadingAddressOptions: any[] = [];

  // Bools for if add new address button is clicked
  showNewLoadingAddress: boolean = false;
  showNewUnloadingAddress: boolean = false;
  showNewBackhaulLoadingAddress: boolean = false;
  showNewBackhaulUnloadingAddress: boolean = false;


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

  fetchLoadingAddresses() {
    this.addressService.getAllAddresses().subscribe({
      next: (addresses) => {
        this.loadingAddressOptions = addresses;
      },
      error: (error) => {
        console.error('Failed to fetch addresses:', error);
      }
    });
  }
  fetchUnloadingAddresses() {
    this.addressService.getAllAddresses()
        .subscribe(addrs => this.unloadingAddressOptions = addrs);
  }
  
  

  addLoadingAddress() {
    const latitude = this.jobForm.get('loadingLatitude')?.value;
    const longitude = this.jobForm.get('loadingLongitude')?.value;
  
    if (!latitude || !longitude) {
      alert('Latitude and Longitude are required.');
      return;
    }
  
    const latitudeRegex = /^-?\d{1,3}\.\d{1,6}$/;
    const longitudeRegex = /^-?\d{1,3}\.\d{1,6}$/;
  
    if (!latitudeRegex.test(latitude) || !longitudeRegex.test(longitude)) {
      alert('Latitude and Longitude must be valid decimal numbers with up to 6 decimal places.');
      return;
    }
    const newAddress = this.jobForm.get('newLoadingAddress')?.value?.trim();
  
    if (newAddress) {
      const addressData = {
        street_address: newAddress,
        country: this.jobForm.get('loadingCountry')?.value,
        state: this.jobForm.get('loadingState')?.value,
        city: this.jobForm.get('loadingCity')?.value,
        zip_code: this.jobForm.get('loadingZipCode')?.value,
        location_name: this.jobForm.get('loadingLocationName')?.value,
        latitude: this.jobForm.get('loadingLatitude')?.value,
        longitude: this.jobForm.get('loadingLongitude')?.value,
        location_type: this.jobForm.get('loadingLocationType')?.value
      };
  
  
      this.addressService.createAddress(addressData).subscribe({
        next: (response) => {
          console.log('Address created:', response);
          this.fetchLoadingAddresses();
          this.jobForm.patchValue({
            newLoadingAddress: '',
            loadingCountry: 'United States',
            loadingState: '',
            loadingCity: '',
            loadingZipCode: '',
            loadingLocationName: '',
            loadingLatitude: '',
            loadingLongitude: '',
            loadingLocationType: ''
          });
          this.showNewLoadingAddress = false;
        },
        error: (error) => {
          console.error('Failed to create address:', error);
        }
      });
    }
  }
  
  addUnloadingAddress() {
    const street = this.jobForm.get('newUnloadingAddress')!.value.trim();
    // … validate latitude/longitude, etc.
  
    const payload = {
      street_address: street,
      country: this.jobForm.get('unloadingCountry')!.value,
      state:   this.jobForm.get('unloadingState')!.value,
      city:    this.jobForm.get('unloadingCity')!.value,
      zip_code:    this.jobForm.get('unloadingZipCode')!.value,
      location_name: this.jobForm.get('unloadingLocationName')!.value,
      latitude:  +this.jobForm.get('unloadingLatitude')!.value,
      longitude: +this.jobForm.get('unloadingLongitude')!.value,
      location_type: this.jobForm.get('unloadingLocationType')!.value
    };
  
    this.addressService.createAddress(payload).subscribe({
      next: (addr) => {
        // addr should now have an `id` field
        this.fetchUnloadingAddresses();          // reload the list from the server
        this.jobForm.patchValue({
          unloadingAddresses: addr.id,           // set the control to the new numeric ID
          newUnloadingAddress: '',
          unloadingCountry: 'United States',
          unloadingState: '',
          unloadingCity: '',
          unloadingZipCode: '',
          unloadingLocationName: '',
          unloadingLatitude: '',
          unloadingLongitude: '',
          unloadingLocationType: ''
        });
        this.showNewUnloadingAddress = false;
      },
      error: (e) => console.error('Could not create unloading address', e)
    });
  }
  
  addBackhaulLoadingAddress() {
    const newAddress = this.jobForm.get('newBackhaulLoadingAddress')?.value?.trim();
  
    if (newAddress) {
      const fullAddress = `${newAddress}, ${this.jobForm.get('backhaulLoadingCity')?.value}, ${this.jobForm.get('backhaulLoadingState')?.value}, ${this.jobForm.get('backhaulLoadingZipCode')?.value}, ${this.jobForm.get('backhaulLoadingCountry')?.value}, ${this.jobForm.get('backhaulLoadingLocationName')?.value}, ${this.jobForm.get('backhaulLoadingLatitude')?.value}, ${this.jobForm.get('backhaulLoadingLongitude')?.value}, ${this.jobForm.get('backhaulLoadingLocationType')?.value}`;
  
      this.backhaulLoadingAddressOptions.push(fullAddress);
      this.jobForm.get('backhaulLoadingAddresses')?.setValue(fullAddress);
  
      this.jobForm.patchValue({
        newBackhaulLoadingAddress: '',
        backhaulLoadingCountry: 'United States',
        backhaulLoadingState: '',
        backhaulLoadingCity: '',
        backhaulLoadingZipCode: '',
        backhaulLoadingLocationName: '',
        backhaulLoadingLatitude: '',
        backhaulLoadingLongitude: '',
        backhaulLoadingLocationType: ''
      });
      this.showNewBackhaulLoadingAddress = false;
    }
  }
  
  addBackhaulUnloadingAddress() {
    const newAddress = this.jobForm.get('newBackhaulUnloadingAddress')?.value?.trim();
  
    if (newAddress) {
      const fullAddress = `${newAddress}, ${this.jobForm.get('backhaulUnloadingCity')?.value}, ${this.jobForm.get('backhaulUnloadingState')?.value}, ${this.jobForm.get('backhaulUnloadingZipCode')?.value}, ${this.jobForm.get('backhaulUnloadingCountry')?.value}, ${this.jobForm.get('backhaulUnloadingLocationName')?.value}, ${this.jobForm.get('backhaulUnloadingLatitude')?.value}, ${this.jobForm.get('backhaulUnloadingLongitude')?.value}, ${this.jobForm.get('backhaulUnloadingLocationType')?.value}`;
  
      this.backhaulUnloadingAddressOptions.push(fullAddress);
      this.jobForm.get('backhaulUnloadingAddresses')?.setValue(fullAddress);
  
      this.jobForm.patchValue({
        newBackhaulUnloadingAddress: '',
        backhaulUnloadingCountry: 'United States',
        backhaulUnloadingState: '',
        backhaulUnloadingCity: '',
        backhaulUnloadingZipCode: '',
        backhaulUnloadingLocationName: '',
        backhaulUnloadingLatitude: '',
        backhaulUnloadingLongitude: '',
        backhaulUnloadingLocationType: ''
      });
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


  constructor(private router: Router, private addressService: AddressService, private jobService: JobService) {
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
    if (this.jobForm.invalid) {
      alert('Please complete required fields.');
      return;
    }
  
    const formData = this.jobForm.value;
  
    const payload = {
      project: formData.project,
      prime_contractor: formData.primeContractor,
      prime_contractor_project_number: formData.primeContractorProjectNumber,
      contractor_invoice: formData.contractorInvoice,
      new_contractor_invoice: formData.newContractorInvoice || null,
      contractor_invoice_project_number: formData.contractorInvoiceProjectNumber,
      new_contractor_invoice_project_number: formData.newContractorInvoiceProjectNumber || null,
      prevailing_or_not: formData.prevailingOrNot,
      sap_or_sp_number: formData.sapOrSpNumber || null,
      report_requirement: formData.reportRequirement || null,
      contract_number: formData.contractNumber || null,
      prevailing_wage_class_codes: formData.classCodes.map(code => ({
        class_code: code.laborCode,
        base_rate: code.baseRate || 0,
        fringe_rate: code.fringeRate || 0,
        total_standard_time_rate: code.totalStandardTimeRate || 0,
        total_overtime_rate: code.totalOverTimeRate || 0
      })),
      project_id: formData.projectId || null,
      job_description: formData.jobDescription,
      job_number: formData.jobNumber,
      material: formData.material,
      truck_types: formData.truckTypes.map(t => ({
        type: t.type,
        rate: t.rate || 0,
        unit: t.unit || ''
      })),
      job_date: formData.jobDate,
      shift_start: formData.jobStartTime || "00:00:00",
      loading_address: formData.loadingAddresses,    // Make sure you pass ID!
      unloading_address: formData.unloadingAddresses, // Make sure you pass ID!
      is_backhaul_enabled: formData.isBackhaulEnabled,
      backhaul_loading_address: formData.backhaulLoadingAddresses || null,
      backhaul_unloading_address: formData.backhaulUnloadingAddresses || null,
      job_foreman_name: formData.jobForemanName,
      job_foreman_contact: formData.jobForemanContact,
      additional_notes: formData.additionalNotes || null
    };
  
    this.jobService.createJob(payload).subscribe({
      next: (response) => {
        console.log('Job created successfully!', response);
        alert('Job created successfully!');
        this.router.navigate(['/jobs']);
      },
      error: (error) => {
        console.error('Failed to create job:', error);
        alert('Failed to create job. Please check your input carefully.');
      }
    });
  }
  
  
  ngOnInit() {
    this.fetchLoadingAddresses();
  }
}