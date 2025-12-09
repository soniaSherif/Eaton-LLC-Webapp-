import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { CustomerService } from '../../../services/customer.service';
import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditCustomerComponent implements OnInit {
  customerId: number | null = null;
  loading = false;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  customerForm = new FormGroup({
    companyName: new FormControl(''),
    contactName: new FormControl(''),
    companyDBAName: new FormControl(''),
    companyType: new FormControl(''),
    address: new FormControl(''),
    adress2: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl(''),
    state: new FormControl(''),
    zip: new FormControl(''),
    phoneNumber: new FormControl(''),
    faxNumber: new FormControl(''),
    email: new FormControl(''),
    notes: new FormControl(''),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.customerId = idParam ? +idParam : null;
    
    if (this.customerId) {
      this.loadCustomer(this.customerId);
    } else {
      this.router.navigate(['/customers']);
    }
  }

  loadCustomer(id: number): void {
    this.loading = true;
    this.customerService.getCustomerById(id)
      .pipe(
        catchError(err => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load customer',
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            showConfirmButton: false
          });
          this.router.navigate(['/customers']);
          return of(null);
        })
      )
      .subscribe(customer => {
        if (customer) {
          this.customerForm.patchValue({
            companyName: customer.company_name || '',
            contactName: customer.contact_name || '',
            companyDBAName: customer.company_dba_name || '',
            companyType: customer.company_type || '',
            address: customer.address || '',
            adress2: customer.address2 || '',
            city: customer.city || '',
            country: customer.country || '',
            state: customer.state || '',
            zip: customer.zip || customer.zip_code || '',
            phoneNumber: customer.phone_number || '',
            faxNumber: customer.fax_number || '',
            email: customer.email || '',
            notes: customer.additional_comments || customer.notes || ''
          });
        }
        this.loading = false;
      });
  }

  submitCustomer() {
    if (!this.customerId) return;

    const formData = this.customerForm.value;

    const payload = {
      company_name: formData.companyName,
      contact_name: formData.contactName,
      company_dba_name: formData.companyDBAName,
      address: formData.address,
      city: formData.city,
      phone_number: formData.phoneNumber,
      email: formData.email,
      additional_comments: formData.notes
    };

    this.loading = true;
    this.customerService.updateCustomer(this.customerId, payload)
      .pipe(
        catchError(err => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update customer 😢',
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            showConfirmButton: false
          });
          console.error(err);
          return of(null);
        })
      )
      .subscribe(res => {
        if (res) {
          Swal.fire({
            icon: 'success',
            title: 'Customer Updated',
            text: 'Customer has been successfully updated 🎉',
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            showConfirmButton: false
          });
          this.router.navigate(['/customers']);
        }
        this.loading = false;
      });
  }

  cancel() {
    this.router.navigate(['/customers']);
  }
}

