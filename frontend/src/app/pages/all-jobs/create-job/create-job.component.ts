import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { AddressService } from 'src/app/services/address.service';
import { JobService } from 'src/app/services/job.service';
import { CustomerService } from 'src/app/services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent implements OnInit {
  jobForm: FormGroup;

  // Form groups for each step 
  step1FormGroup!: FormGroup;
  step2FormGroup!: FormGroup;
  step3FormGroup!: FormGroup;
  step4FormGroup!: FormGroup;

  isOtherContractor = false;
  isOtherContractorProjectNumber = false;
  isPrevailing = false;
  isAASHTOWare = false;

  primeContractors: string[] = [];
  filteredPrimeContractors: string[] = [];

  invoicedContractors: string[] = [];
  filteredInvoicedContractors: string[] = [];

  addressOptions = {
    loading: [],
    unloading: [],
    backhaulLoading: [],
    backhaulUnloading: []
  };

  showNewAddress = {
    loading: false,
    unloading: false,
    backhaulLoading: false,
    backhaulUnloading: false
  };

  readonly prevailingOptions = ['AASHTOWare', 'LPC truck', 'salesforce'];
  readonly states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];
  readonly locationTypes = [
    'Building Material', 'Cement', 'Distribution Center', 'Job Site', 'Landfill',
    'Mine', 'Not Set', 'Plant', 'Quarry', 'Yard'
  ];

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private addressService: AddressService,
    private jobService: JobService,
    private customerService: CustomerService
  ) {
    this.jobForm = this.createForm();
    this.createStepFormGroups(); // NEW METHOD
    this.setupFormListeners();
  }

  ngOnInit(): void {
    this.fetchAddresses();
    this.fetchCustomers();
  }

  get classCodes(): FormArray {
    return this.jobForm.get('classCodes') as FormArray;
  }

  get isBackhaulEnabled(): boolean {
    return this.jobForm.get('isBackhaulEnabled')?.value;
  }

  // NEW METHOD: Create separate FormGroups for each step
  private createStepFormGroups(): void {
    // Step 1: Project Details
    this.step1FormGroup = this.fb.group({
      project: this.jobForm.get('project'),
      primeContractor: this.jobForm.get('primeContractor'),
      primeContractorProjectNumber: this.jobForm.get('primeContractorProjectNumber'),
      contractorInvoice: this.jobForm.get('contractorInvoice'),
      contractorInvoiceProjectNumber: this.jobForm.get('contractorInvoiceProjectNumber'),
      prevailingOrNot: this.jobForm.get('prevailingOrNot')
    });

    // Step 2: Job Rate & Material
    this.step2FormGroup = this.fb.group({
      jobDescription: this.jobForm.get('jobDescription'),
      jobNumber: this.jobForm.get('jobNumber'),
      material: this.jobForm.get('material')
    });

    // Step 3: Loading & Unloading (no required fields, so use empty FormGroup)
    this.step3FormGroup = this.fb.group({
      placeholder: new FormControl('') // Dummy control to make stepper work
    });

    // Step 4: Additional Notes (no required fields)
    this.step4FormGroup = this.fb.group({
      placeholder: new FormControl('')
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      project: ['', Validators.required],
      primeContractor: ['', Validators.required],
      primeContractorProjectNumber: ['', Validators.required],
      contractorInvoice: ['', Validators.required],
      newContractorInvoice: [''],
      contractorInvoiceProjectNumber: ['', Validators.required],
      newContractorInvoiceProjectNumber: [''],
      prevailingOrNot: ['', Validators.required],
      prevailingType: [''],
      sapOrSpNumber: [''],
      reportRequirement: [''],
      contractNumber: [''],
      projectId: [''],
      classCodes: this.fb.array([]),
      
      jobDescription: ['', Validators.required],
      jobNumber: ['', Validators.required],
      material: ['', Validators.required],
      invoiceType: [''],
      itoMtoRate: [''],
      haulRate: [''],
      
      jobDate: [''],
      jobStartTime: [''],
      
      loadingAddress: [''],
      unloadingAddress: [''],
      backhaulLoadingAddress: [''],
      backhaulUnloadingAddress: [''],
      
      newLoadingAddress: [''],
      loadingCountry: ['United States'],
      loadingState: [''],
      loadingCity: [''],
      loadingZipCode: [''],
      loadingLocationName: [''],
      loadingLatitude: [''],
      loadingLongitude: [''],
      loadingLocationType: [''],
      
      newUnloadingAddress: [''],
      unloadingCountry: ['United States'],
      unloadingState: [''],
      unloadingCity: [''],
      unloadingZipCode: [''],
      unloadingLocationName: [''],
      unloadingLatitude: [''],
      unloadingLongitude: [''],
      unloadingLocationType: [''],
      
      newBackhaulLoadingAddress: [''],
      backhaulLoadingCountry: ['United States'],
      backhaulLoadingState: [''],
      backhaulLoadingCity: [''],
      backhaulLoadingZipCode: [''],
      backhaulLoadingLocationName: [''],
      backhaulLoadingLatitude: [''],
      backhaulLoadingLongitude: [''],
      backhaulLoadingLocationType: [''],
      
      newBackhaulUnloadingAddress: [''],
      backhaulUnloadingCountry: ['United States'],
      backhaulUnloadingState: [''],
      backhaulUnloadingCity: [''],
      backhaulUnloadingZipCode: [''],
      backhaulUnloadingLocationName: [''],
      backhaulUnloadingLatitude: [''],
      backhaulUnloadingLongitude: [''],
      backhaulUnloadingLocationType: [''],
      
      logWeight: [''],
      ticketNumber: [''],
      ticketPhoto: [''],
      signature: [''],
      trackLoadingTime: [''],
      unloadLogWeight: [''],
      unloadTicketNumber: [''],
      unloadTicketPhoto: [''],
      unloadSignature: [''],
      
      isBackhaulEnabled: [false],
      backhaulOption: [''],
      jobForemanName: [''],
      jobForemanContact: [''],
      additionalNotes: ['']
    });
  }

  private setupFormListeners(): void {
    this.jobForm.get('primeContractor')?.valueChanges.subscribe(value => {
      if (value && value.trim().length > 0) {
        this.filteredPrimeContractors = this.primeContractors.filter(contractor =>
          contractor.toLowerCase().includes(value.toLowerCase())
        );
      } else if (value === '') {
        this.filteredPrimeContractors = [...this.primeContractors];
      } else {
        this.filteredPrimeContractors = [];
      }
    });

    this.jobForm.get('contractorInvoice')?.valueChanges.subscribe(value => {
      if (value && value.trim().length > 0) {
        this.filteredInvoicedContractors = this.invoicedContractors.filter(contractor =>
          contractor.toLowerCase().includes(value.toLowerCase())
        );
      } else if (value === '') {
        this.filteredInvoicedContractors = [...this.invoicedContractors];
      } else {
        this.filteredInvoicedContractors = [];
      }
      this.isOtherContractor = value === 'other';
    });

    this.jobForm.get('contractorInvoiceProjectNumber')?.valueChanges.subscribe(
      value => this.isOtherContractorProjectNumber = value === 'other'
    );

    this.jobForm.get('prevailingOrNot')?.valueChanges.subscribe(value => {
      this.isPrevailing = value === 'prevailing';
      const prevailingTypeControl = this.jobForm.get('prevailingType');
      
      if (this.isPrevailing) {
        prevailingTypeControl?.setValidators(Validators.required);
        // Add prevailingType to step1FormGroup validation dynamically
        this.step1FormGroup.addControl('prevailingType', prevailingTypeControl as FormControl);
        if (this.classCodes.length === 0) {
          ['602', '604', '607'].forEach(code => this.addClassCode(code));
        }
      } else {
        prevailingTypeControl?.clearValidators();
        this.jobForm.patchValue({ prevailingType: '' });
        this.isAASHTOWare = false;
        // Remove prevailingType from step1FormGroup validation
        this.step1FormGroup.removeControl('prevailingType');
        while (this.classCodes.length > 0) {
          this.classCodes.removeAt(0);
        }
      }
      prevailingTypeControl?.updateValueAndValidity();
    });

    this.jobForm.get('prevailingType')?.valueChanges.subscribe(value => {
      this.isAASHTOWare = value === 'AASHTOWare';
    });
  }

  selectPrimeContractor(contractor: string): void {
    this.jobForm.patchValue({ primeContractor: contractor });
    this.filteredPrimeContractors = [];
  }

  onPrimeContractorFocus(): void {
    const currentValue = this.jobForm.get('primeContractor')?.value;
    if (!currentValue || currentValue.trim() === '') {
      this.filteredPrimeContractors = [...this.primeContractors];
    }
  }

  onPrimeContractorBlur(): void {
    setTimeout(() => {
      this.filteredPrimeContractors = [];
    }, 200);
  }

  selectInvoicedContractor(contractor: string): void {
    this.jobForm.patchValue({ contractorInvoice: contractor });
    this.filteredInvoicedContractors = [];
  }

  onInvoicedContractorFocus(): void {
    const currentValue = this.jobForm.get('contractorInvoice')?.value;
    if (!currentValue || currentValue.trim() === '') {
      this.filteredInvoicedContractors = [...this.invoicedContractors];
    }
  }

  onInvoicedContractorBlur(): void {
    setTimeout(() => {
      this.filteredInvoicedContractors = [];
    }, 200);
  }

  private fetchAddresses(): void {
    this.addressService.getAllAddresses().subscribe({
      next: addresses => {
        this.addressOptions.loading = addresses;
        this.addressOptions.unloading = addresses;
        this.addressOptions.backhaulLoading = addresses;
        this.addressOptions.backhaulUnloading = addresses;
      },
      error: err => console.error('Failed to fetch addresses:', err)
    });
  }

  private fetchCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: customers => {
        this.primeContractors = customers.map(c => 
          c.name || c.company_name || c.customer_name || c.business_name
        ).filter(name => name);
        
        this.invoicedContractors = [...this.primeContractors];
      },
      error: err => console.error('Failed to fetch customers:', err)
    });
  }

  addClassCode(code: string): void {
    this.classCodes.push(this.fb.group({
      laborCode: [code],
      baseRate: [''],
      fringeRate: [''],
      totalStandardTimeRate: [''],
      totalOverTimeRate: ['']
    }));
  }

  addLoadingAddress(): void {
    const street = this.jobForm.get('newLoadingAddress')?.value?.trim();
    if (!street) return;

    const lat = this.jobForm.get('loadingLatitude')?.value;
    const lng = this.jobForm.get('loadingLongitude')?.value;

    if (!this.validateCoordinates(lat, lng)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Coordinates',
        text: 'Latitude and Longitude must be valid decimal numbers with up to 6 decimal places.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload = {
      street_address: street,
      country: this.jobForm.get('loadingCountry')?.value,
      state: this.jobForm.get('loadingState')?.value,
      city: this.jobForm.get('loadingCity')?.value,
      zip_code: this.jobForm.get('loadingZipCode')?.value,
      location_name: this.jobForm.get('loadingLocationName')?.value,
      latitude: lat,
      longitude: lng,
      location_type: this.jobForm.get('loadingLocationType')?.value
    };

    this.addressService.createAddress(payload).subscribe({
      next: () => {
        this.fetchAddresses();
        this.resetLoadingForm();
        this.showNewAddress.loading = false;
      },
      error: err => console.error('Failed to create loading address:', err)
    });
  }

  addUnloadingAddress(): void {
    const street = this.jobForm.get('newUnloadingAddress')?.value?.trim();
    if (!street) return;

    const lat = this.jobForm.get('unloadingLatitude')?.value;
    const lng = this.jobForm.get('unloadingLongitude')?.value;

    if (!this.validateCoordinates(lat, lng)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Coordinates',
        text: 'Latitude and Longitude must be valid decimal numbers with up to 6 decimal places.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload = {
      street_address: street,
      country: this.jobForm.get('unloadingCountry')?.value,
      state: this.jobForm.get('unloadingState')?.value,
      city: this.jobForm.get('unloadingCity')?.value,
      zip_code: this.jobForm.get('unloadingZipCode')?.value,
      location_name: this.jobForm.get('unloadingLocationName')?.value,
      latitude: lat,
      longitude: lng,
      location_type: this.jobForm.get('unloadingLocationType')?.value
    };

    this.addressService.createAddress(payload).subscribe({
      next: addr => {
        this.fetchAddresses();
        this.jobForm.patchValue({ unloadingAddress: addr.id });
        this.resetUnloadingForm();
        this.showNewAddress.unloading = false;
      },
      error: err => console.error('Failed to create unloading address:', err)
    });
  }

  addBackhaulLoadingAddress(): void {
    const street = this.jobForm.get('newBackhaulLoadingAddress')?.value?.trim();
    if (!street) return;

    const lat = this.jobForm.get('backhaulLoadingLatitude')?.value;
    const lng = this.jobForm.get('backhaulLoadingLongitude')?.value;

    if (!this.validateCoordinates(lat, lng)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Coordinates',
        text: 'Latitude and Longitude must be valid decimal numbers with up to 6 decimal places.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload = {
      street_address: street,
      country: this.jobForm.get('backhaulLoadingCountry')?.value,
      state: this.jobForm.get('backhaulLoadingState')?.value,
      city: this.jobForm.get('backhaulLoadingCity')?.value,
      zip_code: this.jobForm.get('backhaulLoadingZipCode')?.value,
      location_name: this.jobForm.get('backhaulLoadingLocationName')?.value,
      latitude: lat,
      longitude: lng,
      location_type: this.jobForm.get('backhaulLoadingLocationType')?.value
    };

    this.addressService.createAddress(payload).subscribe({
      next: () => {
        this.fetchAddresses();
        this.resetBackhaulLoadingForm();
        this.showNewAddress.backhaulLoading = false;
      },
      error: err => console.error('Failed to create backhaul loading address:', err)
    });
  }

  addBackhaulUnloadingAddress(): void {
    const street = this.jobForm.get('newBackhaulUnloadingAddress')?.value?.trim();
    if (!street) return;

    const lat = this.jobForm.get('backhaulUnloadingLatitude')?.value;
    const lng = this.jobForm.get('backhaulUnloadingLongitude')?.value;

    if (!this.validateCoordinates(lat, lng)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Coordinates',
        text: 'Latitude and Longitude must be valid decimal numbers with up to 6 decimal places.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload = {
      street_address: street,
      country: this.jobForm.get('backhaulUnloadingCountry')?.value,
      state: this.jobForm.get('backhaulUnloadingState')?.value,
      city: this.jobForm.get('backhaulUnloadingCity')?.value,
      zip_code: this.jobForm.get('backhaulUnloadingZipCode')?.value,
      location_name: this.jobForm.get('backhaulUnloadingLocationName')?.value,
      latitude: lat,
      longitude: lng,
      location_type: this.jobForm.get('backhaulUnloadingLocationType')?.value
    };

    this.addressService.createAddress(payload).subscribe({
      next: () => {
        this.fetchAddresses();
        this.resetBackhaulUnloadingForm();
        this.showNewAddress.backhaulUnloading = false;
      },
      error: err => console.error('Failed to create backhaul unloading address:', err)
    });
  }

  private validateCoordinates(lat: string, lng: string): boolean {
    if (!lat || !lng) return false;
    const regex = /^-?\d{1,3}\.\d{1,6}$/;
    return regex.test(lat) && regex.test(lng);
  }

  private resetLoadingForm(): void {
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
  }

  private resetUnloadingForm(): void {
    this.jobForm.patchValue({
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
  }

  private resetBackhaulLoadingForm(): void {
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
  }

  private resetBackhaulUnloadingForm(): void {
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
  }

  // UPDATED METHOD: Simplified - let stepControl handle validation
  nextStep(stepper: any): void {
    const currentStepIndex = stepper.selectedIndex;
    
    // Get the current step's FormGroup
    let currentStepForm: FormGroup | null = null;
    switch(currentStepIndex) {
      case 0:
        currentStepForm = this.step1FormGroup;
        break;
      case 1:
        currentStepForm = this.step2FormGroup;
        break;
      case 2:
        currentStepForm = this.step3FormGroup;
        break;
      case 3:
        currentStepForm = this.step4FormGroup;
        break;
    }

    if (currentStepForm && currentStepForm.invalid) {
      currentStepForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Missing Required Fields',
        text: 'Please fill out all required fields (marked with *) before proceeding.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    stepper.next();
  }

  submitJob(): void {
    const requiredFields = Object.keys(this.jobForm.controls).filter(
      key => {
        const control = this.jobForm.get(key);
        return control?.hasValidator(Validators.required) && control?.invalid;
      }
    );

    if (requiredFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please complete all required fields (marked with *) before submitting.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const form = this.jobForm.value;
    
    const payload = {
      project: form.project,
      prime_contractor: form.primeContractor,
      prime_contractor_project_number: form.primeContractorProjectNumber,
      contractor_invoice: form.contractorInvoice,
      new_contractor_invoice: form.newContractorInvoice || null,
      contractor_invoice_project_number: form.contractorInvoiceProjectNumber,
      new_contractor_invoice_project_number: form.newContractorInvoiceProjectNumber || null,
      prevailing_or_not: form.prevailingOrNot,
      prevailing_type: form.prevailingType || null,
      sap_or_sp_number: form.sapOrSpNumber || null,
      report_requirement: form.reportRequirement || null,
      contract_number: form.contractNumber || null,
      prevailing_wage_class_codes: form.classCodes?.map(code => ({
        class_code: code.laborCode,
        base_rate: code.baseRate || 0,
        fringe_rate: code.fringeRate || 0,
        total_standard_time_rate: code.totalStandardTimeRate || 0,
        total_overtime_rate: code.totalOverTimeRate || 0
      })) || [],
      project_id: form.projectId || null,
      job_description: form.jobDescription,
      job_number: form.jobNumber,
      material: form.material,
      job_date: form.jobDate || null,
      shift_start: form.jobStartTime || '00:00:00',
      loading_address: form.loadingAddress || null,
      unloading_address: form.unloadingAddress || null,
      is_backhaul_enabled: form.isBackhaulEnabled,
      backhaul_loading_address: form.backhaulLoadingAddress || null,
      backhaul_unloading_address: form.backhaulUnloadingAddress || null,
      job_foreman_name: form.jobForemanName || null,
      job_foreman_contact: form.jobForemanContact || null,
      additional_notes: form.additionalNotes || null
    };

    this.jobService.createJob(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Job created successfully!',
          confirmButtonColor: '#28a745'
        }).then(() => this.router.navigate(['/all-jobs']));
      },
      error: err => {
        console.error('Failed to create job:', err);
        Swal.fire({
          icon: 'error',
          title: 'Job Creation Failed',
          text: 'Please check your input and try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}