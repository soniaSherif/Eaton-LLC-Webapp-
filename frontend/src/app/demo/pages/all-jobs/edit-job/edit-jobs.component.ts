// src/app/demo/pages/all-jobs/edit-job/edit-jobs.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule }            from '@angular/common';
import {
  FormGroup,
  FormControl,
  FormArray,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CdkStepperModule }        from '@angular/cdk/stepper';
import { NgStepperModule }         from 'angular-ng-stepper';

import { AddressService }    from 'src/app/services/address.service';
import { JobService }        from 'src/app/services/job.service';

@Component({
  selector: 'app-edit-jobs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CdkStepperModule,
    NgStepperModule
  ],
  templateUrl: './edit-jobs.component.html',
  styleUrls: ['./edit-jobs.component.scss']
})
export class EditJobsComponent implements OnInit {
  jobForm = new FormGroup({
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

    jobDescription: new FormControl(''),
    jobNumber: new FormControl(''),
    material: new FormControl(''),
    truckTypes: new FormArray([]),

    jobDate: new FormControl(''),
    jobStartTime: new FormControl(''),

    loadingAddresses: new FormControl(''),
    newLoadingAddress: new FormControl(''),
    loadingCountry: new FormControl('United States'),
    loadingState: new FormControl(''),
    loadingCity: new FormControl(''),
    loadingZipCode: new FormControl(''),
    loadingLocationName: new FormControl(''),
    loadingLatitude: new FormControl(''),
    loadingLongitude: new FormControl(''),
    loadingLocationType: new FormControl(''),

    unloadingAddresses: new FormControl(''),
    newUnloadingAddress: new FormControl(''),
    unloadingCountry: new FormControl('United States'),
    unloadingState: new FormControl(''),
    unloadingCity: new FormControl(''),
    unloadingZipCode: new FormControl(''),
    unloadingLocationName: new FormControl(''),
    unloadingLatitude: new FormControl(''),
    unloadingLongitude: new FormControl(''),
    unloadingLocationType: new FormControl(''),

    backhaulLoadingAddresses: new FormControl(''),
    newBackhaulLoadingAddress: new FormControl(''),
    backhaulLoadingCountry: new FormControl('United States'),
    backhaulLoadingState: new FormControl(''),
    backhaulLoadingCity: new FormControl(''),
    backhaulLoadingZipCode: new FormControl(''),
    backhaulLoadingLocationName: new FormControl(''),
    backhaulLoadingLatitude: new FormControl(''),
    backhaulLoadingLongitude: new FormControl(''),
    backhaulLoadingLocationType: new FormControl(''),

    backhaulUnloadingAddresses: new FormControl(''),
    newBackhaulUnloadingAddress: new FormControl(''),
    backhaulUnloadingCountry: new FormControl('United States'),
    backhaulUnloadingState: new FormControl(''),
    backhaulUnloadingCity: new FormControl(''),
    backhaulUnloadingZipCode: new FormControl(''),
    backhaulUnloadingLocationName: new FormControl(''),
    backhaulUnloadingLatitude: new FormControl(''),
    backhaulUnloadingLongitude: new FormControl(''),
    backhaulUnloadingLocationType: new FormControl(''),

    isBackhaulEnabled: new FormControl(false),
    jobForemanName: new FormControl(''),
    jobForemanContact: new FormControl(''),
    additionalNotes: new FormControl('')
  });

  isOtherContractor = false;
  isOtherContractorProjectNumber = false;
  isPrevailing = false;
  isNonPrevailing = false;
  availableTruckTypes = ['Belly','Side','End','Quint','Quad','Tri'];

  loadingAddressOptions: any[] = [];
  unloadingAddressOptions: any[] = [];
  backhaulLoadingAddressOptions: any[] = [];
  backhaulUnloadingAddressOptions: any[] = [];

  showNewLoadingAddress = false;
  showNewUnloadingAddress = false;
  showNewBackhaulLoadingAddress = false;
  showNewBackhaulUnloadingAddress = false;

  countryOptions = ['United States'];
  stateOptions = [ /* ... all 50 states ... */ ];
  locationTypeOptions = [ 'Building Material','Cement','Distribution Center','Job Site','Landfill','Mine','Not Set','Plant','Quarry','Yard' ];

  loadingOptions = [
    { label: 'Log Weight',     controlName: 'logWeight' },
    { label: 'Ticket Number',  controlName: 'ticketNumber' },
    { label: 'Ticket Photo',   controlName: 'ticketPhoto' },
    { label: 'Signature',      controlName: 'signature' },
    { label: 'Track Loading Time', controlName: 'trackLoadingTime' }
  ];
  unloadingOptions = [
    { label: 'Log Weight',    controlName: 'unloadLogWeight' },
    { label: 'Ticket Number', controlName: 'unloadTicketNumber' },
    { label: 'Ticket Photo',  controlName: 'unloadTicketPhoto' },
    { label: 'Signature',     controlName: 'unloadSignature' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private addressService: AddressService,
    private jobService: JobService
  ) {
    // same listeners as in create
    this.jobForm.get('contractorInvoice')!
      .valueChanges.subscribe(v => this.isOtherContractor = v === 'other');
    this.jobForm.get('contractorInvoiceProjectNumber')!
      .valueChanges.subscribe(v => this.isOtherContractorProjectNumber = v === 'other');
    this.jobForm.get('prevailingOrNot')!
      .valueChanges.subscribe(v => {
        this.isPrevailing = v === 'prevailing';
        this.isNonPrevailing = v === 'nonPrevailing';
        if (this.isPrevailing && this.classCodes.length === 0) {
          ['602','604','607'].forEach(code => this.addClassCode(code));
        }
      });
  }

  ngOnInit() {
    // load dropdowns
    this.addressService.getAllAddresses().subscribe(a => this.loadingAddressOptions = a);
    this.addressService.getAllAddresses().subscribe(a => this.unloadingAddressOptions = a);
    this.addressService.getAllAddresses().subscribe(a => this.backhaulLoadingAddressOptions = a);
    this.addressService.getAllAddresses().subscribe(a => this.backhaulUnloadingAddressOptions = a);

    // fetch job and patch
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobById(id).subscribe(job => {
      this.jobForm.patchValue({
        project: job.project,
        primeContractor: job.prime_contractor,
        primeContractorProjectNumber: job.prime_contractor_project_number,
        contractorInvoice: job.contractor_invoice,
        newContractorInvoice: job.new_contractor_invoice,
        contractorInvoiceProjectNumber: job.contractor_invoice_project_number,
        newContractorInvoiceProjectNumber: job.new_contractor_invoice_project_number,
        // prevailingOrNot: job.prevailing_or_not,
        sapOrSpNumber: job.sap_or_sp_number,
        reportRequirement: job.report_requirement,
        contractNumber: job.contract_number,
        projectId: job.project_id,
        jobDescription: job.job_description,
        jobNumber: job.job_number,
        material: job.material,
        jobDate: job.job_date,
        jobStartTime: job.shift_start,

        loadingAddresses: job.loading_address,
        unloadingAddresses: job.unloading_address,
        backhaulLoadingAddresses: job.backhaul_loading_address,
        backhaulUnloadingAddresses: job.backhaul_unloading_address,

        isBackhaulEnabled: job.is_backhaul_enabled,
        jobForemanName: job.job_foreman_name,
        jobForemanContact: job.job_foreman_contact,
        additionalNotes: job.additional_notes
      });
      this.classCodes.clear();

      // patch classCodes
      job.prevailing_wage_class_codes.forEach((c:any) => {
        this.classCodes.push(new FormGroup({
          laborCode:               new FormControl(c.class_code),
          baseRate:                new FormControl(c.base_rate),
          fringeRate:              new FormControl(c.fringe_rate),
          totalStandardTimeRate:   new FormControl(c.total_standard_time_rate),
          totalOverTimeRate:       new FormControl(c.total_overtime_rate)
        }));
      });
      this.jobForm.get('prevailingOrNot')!
      .setValue(job.prevailing_or_not);
      
      this.truckTypes.clear();
      // patch truckTypes
      job.truck_types.forEach((t:any) => {
        this.truckTypes.push(new FormGroup({
          type: new FormControl(t.type),
          rate: new FormControl(t.rate),
          unit: new FormControl(t.unit)
        }));
      });
      

      // set flags from initial values
      this.isOtherContractor = this.jobForm.value.contractorInvoice === 'other';
      this.isOtherContractorProjectNumber =
        this.jobForm.value.contractorInvoiceProjectNumber === 'other';
    });
  }

  // helpers for FormArray
  get truckTypes() { return this.jobForm.get('truckTypes') as FormArray; }
  get classCodes()  { return this.jobForm.get('classCodes')  as FormArray; }

  addClassCode(code: string) {
    this.classCodes.push(new FormGroup({
      laborCode: new FormControl(code),
      baseRate:                new FormControl(''),
      fringeRate:              new FormControl(''),
      totalStandardTimeRate:   new FormControl(''),
      totalOverTimeRate:       new FormControl('')
    }));
  }
  isTruckTypeSelected(type: string): boolean {
    return this.truckTypes.controls
      .some(ctrl => ctrl.value.type === type);
  }

  onTruckTypeChange(evt: any) {
    if (evt.target.checked) {
      this.truckTypes.push(new FormGroup({
        type: new FormControl(evt.target.value),
        rate: new FormControl(''),
        unit: new FormControl('')
      }));
    } else {
      const idx = this.truckTypes.controls.findIndex(g => g.value.type === evt.target.value);
      this.truckTypes.removeAt(idx);
    }
  }

  get isBackhaulEnabled() {
    return this.jobForm.get('isBackhaulEnabled')!.value;
  }

  addLoadingAddress() {
    const lat = this.jobForm.get('loadingLatitude')?.value;
    const lng = this.jobForm.get('loadingLongitude')?.value;
    if (!lat||!lng) { alert('Lat/Lng required'); return; }
    const newAddr = this.jobForm.get('newLoadingAddress')!.value.trim();
    if (!newAddr) return;
    const payload = {
      street_address: newAddr,
      country:        this.jobForm.get('loadingCountry')!.value,
      state:          this.jobForm.get('loadingState')!.value,
      city:           this.jobForm.get('loadingCity')!.value,
      zip_code:       this.jobForm.get('loadingZipCode')!.value,
      location_name:  this.jobForm.get('loadingLocationName')!.value,
      latitude:       lat,
      longitude:      lng,
      location_type:  this.jobForm.get('loadingLocationType')!.value
    };
    this.addressService.createAddress(payload).subscribe({
      next: addr => {
        this.addressService.getAllAddresses()
          .subscribe(a=> this.loadingAddressOptions = a);
        this.jobForm.patchValue({
          newLoadingAddress: '',
          loadingCountry: 'United States', loadingState:'', loadingCity:'', loadingZipCode:'',
          loadingLocationName:'', loadingLatitude:'', loadingLongitude:'', loadingLocationType:''
        });
        this.showNewLoadingAddress = false;
      },
      error: err => console.error(err)
    });
  }
  

  addUnloadingAddress() {
    const street = this.jobForm.get('newUnloadingAddress')!.value.trim();
    if (!street) return;
    const payload = {
      street_address: street,
      country:        this.jobForm.get('unloadingCountry')!.value,
      state:          this.jobForm.get('unloadingState')!.value,
      city:           this.jobForm.get('unloadingCity')!.value,
      zip_code:       this.jobForm.get('unloadingZipCode')!.value,
      location_name:  this.jobForm.get('unloadingLocationName')!.value,
      latitude:       +this.jobForm.get('unloadingLatitude')!.value,
      longitude:      +this.jobForm.get('unloadingLongitude')!.value,
      location_type:  this.jobForm.get('unloadingLocationType')!.value
    };
    this.addressService.createAddress(payload).subscribe({
      next: addr => {
        this.addressService.getAllAddresses()
          .subscribe(a=> this.unloadingAddressOptions = a);
        this.jobForm.patchValue({
          unloadingAddresses: addr.id,
          newUnloadingAddress:'', unloadingCountry:'United States', unloadingState:'', unloadingCity:'',
          unloadingZipCode:'', unloadingLocationName:'', unloadingLatitude:'', unloadingLongitude:'',
          unloadingLocationType:''
        });
        this.showNewUnloadingAddress = false;
      },
      error: e => console.error(e)
    });
  }

  addBackhaulLoadingAddress() {
    const t = this.jobForm.get('newBackhaulLoadingAddress')!.value.trim();
    if (!t) return;
    // for simplicity we just push the string:
    this.backhaulLoadingAddressOptions.push(t);
    this.jobForm.get('backhaulLoadingAddresses')!.setValue(t);
    this.jobForm.patchValue({ newBackhaulLoadingAddress: '' });
    this.showNewBackhaulLoadingAddress = false;
  }

  addBackhaulUnloadingAddress() {
    const t = this.jobForm.get('newBackhaulUnloadingAddress')!.value.trim();
    if (!t) return;
    this.backhaulUnloadingAddressOptions.push(t);
    this.jobForm.get('backhaulUnloadingAddresses')!.setValue(t);
    this.jobForm.patchValue({ newBackhaulUnloadingAddress: '' });
    this.showNewBackhaulUnloadingAddress = false;
  }

  submitJob() {
    if (this.jobForm.invalid) {
      alert('Please fill in required fields.');
      return;
    }
    const id  = Number(this.route.snapshot.paramMap.get('id'));
    const fv = this.jobForm.value;
    const payload = {
      project: fv.project,
      prime_contractor: fv.primeContractor,
      prime_contractor_project_number: fv.primeContractorProjectNumber,
      contractor_invoice: fv.contractorInvoice,
      new_contractor_invoice: fv.newContractorInvoice||null,
      contractor_invoice_project_number: fv.contractorInvoiceProjectNumber,
      new_contractor_invoice_project_number: fv.newContractorInvoiceProjectNumber||null,
      prevailing_or_not: fv.prevailingOrNot,
      sap_or_sp_number: fv.sapOrSpNumber||null,
      report_requirement: fv.reportRequirement||null,
      contract_number: fv.contractNumber||null,
      prevailing_wage_class_codes: this.classCodes.value.map((c:any)=>({
        class_code: c.laborCode,
        base_rate: +c.baseRate,
        fringe_rate: +c.fringeRate,
        total_standard_time_rate: +c.totalStandardTimeRate,
        total_overtime_rate: +c.totalOverTimeRate
      })),
      project_id: fv.projectId||null,
      job_description: fv.jobDescription,
      job_number: fv.jobNumber,
      material: fv.material,
      truck_types: this.truckTypes.value.map((t:any)=>({
        type: t.type, rate: +t.rate, unit: t.unit
      })),
      job_date: fv.jobDate,
      shift_start: fv.jobStartTime||'00:00:00',
      loading_address: fv.loadingAddresses,
      unloading_address: fv.unloadingAddresses,
      is_backhaul_enabled: fv.isBackhaulEnabled,
      backhaul_loading_address: fv.backhaulLoadingAddresses||null,
      backhaul_unloading_address: fv.backhaulUnloadingAddresses||null,
      job_foreman_name: fv.jobForemanName,
      job_foreman_contact: fv.jobForemanContact,
      additional_notes: fv.additionalNotes||null
    };

    this.jobService.updateJob(id, payload).subscribe({
      next: () => {
        alert('Job updated!');
        this.router.navigate(['/jobs']);
      },
      error: err => {
        console.error(err);
        alert('Update failed; please try again.');
      }
    });
  }
}
