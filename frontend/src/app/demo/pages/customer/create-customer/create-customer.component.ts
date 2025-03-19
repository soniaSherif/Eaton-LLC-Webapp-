import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';

@Component({
  selector: 'app-create-customer',
  imports: [CommonModule, ReactiveFormsModule, CdkStepperModule, NgStepperModule],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.scss'
})
export class CreateCustomerComponent {
    customerForm = new FormGroup({
      //contact details
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
      //Billing details not sure how to handle for security 

      //Notes
      notes: new FormControl(''),
    });


  submitCustomer() {
    console.log('Customer Submitted:', this.customerForm.value);
    // TODO: Add API call to submit the form data to the database
  }
}
