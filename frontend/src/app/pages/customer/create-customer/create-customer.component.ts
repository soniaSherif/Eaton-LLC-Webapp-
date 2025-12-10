import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl,Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { CustomerService } from '../../../services/customer.service';
import Swal from 'sweetalert2'; // Replaced toastr with SweetAlert

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CreateCustomerComponent {

  constructor(private router: Router, private customerService: CustomerService) {}
  
customerForm = new FormGroup({
  companyName: new FormControl('', Validators.required),
  companyAddress: new FormControl('', Validators.required),
  companyPhone: new FormControl('', Validators.required),

  companyDispatchContact: new FormControl('', Validators.required),
  companyDispatchContactPhone: new FormControl('', Validators.required),
  companyDispatchContactEmail: new FormControl('', Validators.required),

  companyPrevailingWageContact: new FormControl('', Validators.required),
  companyPrevailingWageContactPhone: new FormControl('', Validators.required),
  companyPrevailingWageContactEmail: new FormControl('', Validators.required),

  companyAPContact: new FormControl('', Validators.required),
  companyAPContactPhone: new FormControl('', Validators.required),
  companyAPContactEmail: new FormControl('', Validators.required),

  companyPaymentTerms: new FormControl('', Validators.required),
  companySalesTaxSetting: new FormControl('', Validators.required),

  notes: new FormControl('')
});

  /* isStepOnevalid() {
    return this.customerForm.valid;
  }  */

  nextStep(stepper: any) {
    if (this.customerForm.valid) {
      stepper.next();
    } else {      
      this.customerForm.markAllAsTouched(); // highlights all empty fields
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill out all required fields before proceeding.',
      });
    }
  }

  /* submitCustomer() {
    if (this.customerForm.valid) {
      this.customerForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill out all required fields before submitting.',
      });
      return;
    } */

  submitCustomer() {
  if (this.customerForm.invalid) {
    this.customerForm.markAllAsTouched();
    Swal.fire({
      icon: 'error',
      title: 'Missing Fields',
      text: 'Please fill out all required fields before submitting.',
    });
    return;
  }

  const formData = this.customerForm.value;
  const payload = {
    company_name: formData.companyName,
    company_address: formData.companyAddress,
    phone_number: formData.companyPhone,  // Changed from company_phone
    email: formData.companyDispatchContactEmail,  // Added this required field

    // Dispatch Contact
    company_dispatch_contact: formData.companyDispatchContact,
    company_dispatch_contact_phone: formData.companyDispatchContactPhone,
    company_dispatch_contact_email: formData.companyDispatchContactEmail,

    // Prevailing Wage Contact
    company_prevailing_wage_contact: formData.companyPrevailingWageContact,
    company_prevailing_wage_contact_phone: formData.companyPrevailingWageContactPhone,
    company_prevailing_wage_contact_email: formData.companyPrevailingWageContactEmail,

    // Accounts Payable Contact
    company_ap_contact: formData.companyAPContact,
    company_ap_contact_phone: formData.companyAPContactPhone,
    company_ap_contact_email: formData.companyAPContactEmail,

    // Settings
    company_payment_terms: formData.companyPaymentTerms,
    company_sales_tax_setting: formData.companySalesTaxSetting,

    // Notes
    additional_comments: formData.notes
  };

  this.customerService.createCustomer(payload).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Customer Created',
        text: 'Customer has been successfully added!',
      }).then(() => {
        this.router.navigate(['/customers']);
      });
    },
    error: (err) => {
      console.error('Failed to create customer:', err);
      console.error('Error details:', err.error);  // This will show us what Django says
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Customer',
        text: 'Please check your input and try again.',
      });
    }
  });
}
}