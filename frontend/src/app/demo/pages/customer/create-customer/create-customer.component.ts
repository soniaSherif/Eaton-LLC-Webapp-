import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { CustomerService } from '../../../../services/customer.service';
import Swal from 'sweetalert2'; // ✅ Replaced toastr with SweetAlert

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CreateCustomerComponent {
  constructor(
    private customerService: CustomerService,
    private router: Router
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

  submitCustomer() {
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

    this.customerService.createCustomer(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Customer Created',
          text: 'Customer has been successfully added 🎉',
          toast: true,
          position: 'bottom-end',
          timer: 3000,
          showConfirmButton: false
        });
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to create customer 😢',
          toast: true,
          position: 'bottom-end',
          timer: 3000,
          showConfirmButton: false
        });
        console.error(err);
      }
    });
  }
}
