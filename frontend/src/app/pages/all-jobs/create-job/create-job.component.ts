import { Component, OnInit } from '@angular/core';
import { CommonModule, NgPlural } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { AddressService } from 'src/app/services/address.service';
import { JobService } from 'src/app/services/job.service';
import { Validators } from '@angular/forms';
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
    step1: new FormGroup({
      project: new FormControl('', Validators.required),
      primeContractor: new FormControl('', Validators.required),
      primeContractorProjectNumber: new FormControl('', Validators.required),
      contractorInvoice: new FormControl('', Validators.required),
      newContractorInvoice: new FormControl(''),  // Only required if "other" selected
      contractorInvoiceProjectNumber: new FormControl('', Validators.required),
      newContractorInvoiceProjectNumber: new FormControl(''),  // Only required if "other" selected
      prevailingOrNot: new FormControl('', Validators.required),
      sapOrSpNumber: new FormControl(''),  // Only for non-prevailing
      reportRequirement: new FormControl(''),
      contractNumber: new FormControl(''),
      projectId: new FormControl(''),
      classCodes: new FormArray([], Validators.required),

      baseRate: new FormControl(''),
      fringeRate: new FormControl(''),
      totalStandardTimeRate: new FormControl(''),
      totalOverTimeRate: new FormControl(''),
    }),
    step2: new FormGroup({
      jobDescription: new FormControl('', Validators.required),
      jobNumber: new FormControl('', Validators.required),
      material: new FormControl('', Validators.required),
      truckTypes: new FormArray([], Validators.required),
      invoiceType: new FormControl(''),
      itoMtoRate: new FormControl(''),
      haulRate: new FormControl(''),

      jobDate: new FormControl('', Validators.required),
      jobStartTime: new FormControl('', Validators.required),
    }),
      // Loading/Unloading address selections 
    step3: new FormGroup({
      loadingAddress: new FormControl('', Validators.required),            
      backhaulLoadingAddress: new FormControl(''),    // Optional
      unloadingAddress: new FormControl('', Validators.required),           
      backhaulUnloadingAddress: new FormControl(''),   // Optional
      
      // Loading options
      loadingAddresses: new FormControl('', Validators.required),
      backhaulLoadingAddresses: new FormControl(''),  // Optional
      loadingOption: new FormControl(''),  // Optional
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
      unloadingAddresses: new FormControl('', Validators.required),
      backhaulUnloadingAddresses: new FormControl(''),  // Optional
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

      // Backhaul unloading address fields - only required if backhaul enabled
      newBackhaulUnloadingAddress: new FormControl(''),
      backhaulUnloadingCountry: new FormControl('United States'),
      backhaulUnloadingState: new FormControl(''),
      backhaulUnloadingCity: new FormControl(''),
      backhaulUnloadingZipCode: new FormControl(''),
      backhaulUnloadingLocationName: new FormControl(''),
      backhaulUnloadingLatitude: new FormControl(''),
      backhaulUnloadingLongitude: new FormControl(''),
      backhaulUnloadingLocationType: new FormControl(''),
}),
      // Job Management
    step4: new FormGroup({
      isBackhaulEnabled: new FormControl(false),
      backhaulOption: new FormControl(''),
      jobForemanName: new FormControl(''),
      jobForemanContact: new FormControl(''),
      additionalNotes: new FormControl('')
  })
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
    this.addressService.getAllAddresses().subscribe({
      next: (addrs) => {
        this.unloadingAddressOptions = addrs;
      },
      error: (error) => {
        console.error('Failed to fetch unloading addresses:', error);
      }
    });
  }
  
  

  addLoadingAddress() {
    const latitude = this.jobForm.get('step3.loadingLatitude')?.value;
    const longitude = this.jobForm.get('step3.loadingLongitude')?.value;
  
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
    const newAddress = this.jobForm.get('step3.newLoadingAddress')?.value?.trim();
  
    if (newAddress) {
      const addressData = {
        street_address: newAddress,
        country: this.jobForm.get('step3.loadingCountry')?.value,
        state: this.jobForm.get('step3.loadingState')?.value,
        city: this.jobForm.get('step3.loadingCity')?.value,
        zip_code: this.jobForm.get('step3.loadingZipCode')?.value,
        location_name: this.jobForm.get('step3.loadingLocationName')?.value,
        latitude: this.jobForm.get('step3.loadingLatitude')?.value,
        longitude: this.jobForm.get('step3.loadingLongitude')?.value,
        location_type: this.jobForm.get('step3.loadingLocationType')?.value
      };
  
  
      this.addressService.createAddress(addressData).subscribe({
        next: (response) => {
          console.log('Address created:', response);
          this.fetchLoadingAddresses();
          (this.jobForm.get('step3') as any)?.patchValue({
            newLoadingAddress:'',
            loadingCountry:'United States',
            loadingState:'',
            loadingCity:'',
            loadingZipCode:'',
            loadingLocationName:'',
            loadingLatitude:null,
            loadingLongitude:null,
            loadingLocationType:''
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
    const street = this.jobForm.get('step3.newUnloadingAddress')!.value.trim();
    const latitude = this.jobForm.get('step3.unloadingLatitude')?.value;
    const longitude = this.jobForm.get('step3.unloadingLongitude')?.value;
    
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
  
    const payload = {
      street_address: street,
      country: this.jobForm.get('step3.unloadingCountry')!.value,
      state: this.jobForm.get('step3.unloadingState')!.value,
      city: this.jobForm.get('step3.unloadingCity')!.value,
      zip_code: this.jobForm.get('step3.unloadingZipCode')!.value,
      location_name: this.jobForm.get('step3.unloadingLocationName')!.value,
      latitude: +this.jobForm.get('step3.unloadingLatitude')!.value,
      longitude: +this.jobForm.get('step3.unloadingLongitude')!.value,
      location_type: this.jobForm.get('step3.unloadingLocationType')!.value
  };
  
    this.addressService.createAddress(payload).subscribe({
      next: (addr) => {
        // addr should now have an `id` field
        this.fetchUnloadingAddresses();          // reload the list from the server
        (this.jobForm.get('step3')as any)?.patchValue({
          unloadingAddresses: addr.id,
          newUnloadingAddress: '',
          unloadingCountry: 'United States',
          unloadingState: '',
          unloadingCity: '',
          unloadingZipCode: '',
          unloadingLocationName: '',
          unloadingLatitude: null,
          unloadingLongitude: null,
          unloadingLocationType: ''
        });
        this.showNewUnloadingAddress = false;
      },
      error: (e) => console.error('Could not create unloading address', e)
    });
  }
  
  addBackhaulLoadingAddress() {
  const street = this.jobForm.get('step3.newBackhaulLoadingAddress')?.value?.trim();
  const latitude = this.jobForm.get('step3.backhaulLoadingLatitude')?.value;
  const longitude = this.jobForm.get('step3.backhaulLoadingLongitude')?.value;

  if (!latitude || !longitude) {
    alert('Latitude and Longitude are required.');
    return;
  }

  const latitudeRegex = /^-?\d{1,3}\.\d{1,6}$/;
  const longitudeRegex = /^-?\d{1,3}\.\d{1,6}$/;

  if (!latitudeRegex.test(latitude) || !longitudeRegex.test(longitude)) {
    alert('Latitude and Longitude must be valid decimal numbers.');
    return;
  }

  if (street) {
    const addressData = {
      street_address: street,
      country: this.jobForm.get('step3.backhaulLoadingCountry')?.value,
      state: this.jobForm.get('step3.backhaulLoadingState')?.value,
      city: this.jobForm.get('step3.backhaulLoadingCity')?.value,
      zip_code: this.jobForm.get('step3.backhaulLoadingZipCode')?.value,
      location_name: this.jobForm.get('step3.backhaulLoadingLocationName')?.value,
      latitude: this.jobForm.get('step3.backhaulLoadingLatitude')?.value,
      longitude: this.jobForm.get('step3.backhaulLoadingLongitude')?.value,
      location_type: this.jobForm.get('step3.backhaulLoadingLocationType')?.value
    };

    this.addressService.createAddress(addressData).subscribe({
      next: (response) => {
        this.backhaulLoadingAddressOptions.push(response);
        (this.jobForm.get('step3')as any)?.patchValue({
          backhaulLoadingAddresses: response.id,
          newBackhaulLoadingAddress: '',
          backhaulLoadingCountry: 'United States',
          backhaulLoadingState: '',
          backhaulLoadingCity: '',
          backhaulLoadingZipCode: '',
          backhaulLoadingLocationName: '',
          backhaulLoadingLatitude: null,
          backhaulLoadingLongitude: null,
          backhaulLoadingLocationType: ''
        });
        this.showNewBackhaulLoadingAddress = false;
      },
      error: (error) => console.error('Failed to create backhaul loading address:', error)
    });
  }
}
  
  addBackhaulUnloadingAddress() {
  const street = this.jobForm.get('step3.newBackhaulUnloadingAddress')?.value?.trim();
  const latitude = this.jobForm.get('step3.backhaulUnloadingLatitude')?.value;
  const longitude = this.jobForm.get('step3.backhaulUnloadingLongitude')?.value;

  if (!latitude || !longitude) {
    alert('Latitude and Longitude are required.');
    return;
  }

  const latitudeRegex = /^-?\d{1,3}\.\d{1,6}$/;
  const longitudeRegex = /^-?\d{1,3}\.\d{1,6}$/;

  if (!latitudeRegex.test(latitude) || !longitudeRegex.test(longitude)) {
    alert('Latitude and Longitude must be valid decimal numbers.');
    return;
  }

  if (street) {
    const addressData = {
      street_address: street,
      country: this.jobForm.get('step3.backhaulUnloadingCountry')?.value,
      state: this.jobForm.get('step3.backhaulUnloadingState')?.value,
      city: this.jobForm.get('step3.backhaulUnloadingCity')?.value,
      zip_code: this.jobForm.get('step3.backhaulUnloadingZipCode')?.value,
      location_name: this.jobForm.get('step3.backhaulUnloadingLocationName')?.value,
      latitude: this.jobForm.get('step3.backhaulUnloadingLatitude')?.value,
      longitude: this.jobForm.get('step3.backhaulUnloadingLongitude')?.value,
      location_type: this.jobForm.get('step3.backhaulUnloadingLocationType')?.value
    };

    this.addressService.createAddress(addressData).subscribe({
      next: (response) => {
        this.backhaulUnloadingAddressOptions.push(response);
        (this.jobForm.get('step3')as any)?.patchValue({
          backhaulUnloadingAddresses: response.id,
          newBackhaulUnloadingAddress: '',
          backhaulUnloadingCountry: 'United States',
          backhaulUnloadingState: '',
          backhaulUnloadingCity: '',
          backhaulUnloadingZipCode: '',
          backhaulUnloadingLocationName: '',
          backhaulUnloadingLatitude: null,
          backhaulUnloadingLongitude: null,
          backhaulUnloadingLocationType: ''
        });
        this.showNewBackhaulUnloadingAddress = false;
      },
      error: (error) => console.error('Failed to create backhaul unloading address:', error)
    });
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
    return this.jobForm.get('step2.truckTypes') as FormArray;
  }

  // Getter for the classCodes FormArray
  get classCodes(): FormArray {
    return this.jobForm.get('step1.classCodes') as FormArray;
  }

  get isBackhaulEnabled(): boolean {
    return this.jobForm.get('step4.isBackhaulEnabled')?.value;
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
    this.jobForm.get('step1.contractorInvoice')?.valueChanges.subscribe((value) => {
      this.isOtherContractor = value === 'other'; // Show new contractor input if "Other" is selected
    });
    this.jobForm.get('step1.contractorInvoiceProjectNumber')?.valueChanges.subscribe((value) => {
      this.isOtherContractorProjectNumber = value === 'other'; // Show new contractor number input if "Other" is selected
    });
    this.jobForm.get('step1.prevailingOrNot')?.valueChanges.subscribe((value) => {
      this.isNonPrevailing = value === 'nonPrevailing'; // Show new SAP or SP number input if "Non-Prevailing" is selected
      this.isPrevailing = value === 'prevailing'; 

      if (this.isPrevailing && this.classCodes.length === 0) {
        ['602', '604', '607'].forEach(code => this.addClassCode(code));
      }
    });  
  }

  ngOnInit(): void {
    this.fetchLoadingAddresses();
    this.fetchUnloadingAddresses();
  }

  submitJob() {
    if (this.jobForm.invalid) {
      alert('Please complete required fields.');
      return;
    }
  
    const step1 = this.jobForm.get('step1')?.value;
    const step2 = this.jobForm.get('step2')?.value;
    const step3 = this.jobForm.get('step3')?.value;
    const step4 = this.jobForm.get('step4')?.value;
  
    const payload = {
      project: step1.project,
      prime_contractor: step1.primeContractor,
      prime_contractor_project_number: step1.primeContractorProjectNumber,
      contractor_invoice: step1.contractorInvoice,
      new_contractor_invoice: step1.newContractorInvoice || null,
      contractor_invoice_project_number: step1.contractorInvoiceProjectNumber,
      new_contractor_invoice_project_number: step1.newContractorInvoiceProjectNumber || null,
      prevailing_or_not: step1.prevailingOrNot,
      sap_or_sp_number: step1.sapOrSpNumber || null,
      report_requirement: step1.reportRequirement || null,
      contract_number: step1.contractNumber || null,
      prevailing_wage_class_codes: step1.classCodes.map((code: any) => ({
        class_code: code.laborCode,
        base_rate: code.baseRate || 0,
        fringe_rate: code.fringeRate || 0,
        total_standard_time_rate: code.totalStandardTimeRate || 0,
        total_overtime_rate: code.totalOverTimeRate || 0
      })),
      project_id: step1.projectId || null,
      job_description: step2.jobDescription,
      job_number: step2.jobNumber,
      material: step2.material,
      truck_types: step2.truckTypes.map((t: any) => ({
        type: t.type,
        rate: t.rate || 0,
        unit: t.unit || ''
      })),
      job_date: step2.jobDate,
      shift_start: step2.jobStartTime || "00:00:00",
      loading_address: step3.loadingAddresses,
      unloading_address: step3.unloadingAddresses,
      is_backhaul_enabled: step4.isBackhaulEnabled,
      backhaul_loading_address: step3.backhaulLoadingAddresses || null,
      backhaul_unloading_address: step3.backhaulUnloadingAddresses || null,
      job_foreman_name: step4.jobForemanName,
      job_foreman_contact: step4.jobForemanContact,
      additional_notes: step4.additionalNotes || null
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
  }

