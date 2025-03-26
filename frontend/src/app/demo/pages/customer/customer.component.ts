import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service'; // adjust path if needed

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  customers: any[] = [];

  constructor(
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    // Start with hardcoded customers
    this.customers = [
      { company_name: 'Jake', phone_number: 'xxx-xxx-xxxx', email: 'test@email', billingId: '556653', selected: false },
      { company_name: 'Sarah', phone_number: 'xxx-xxx-xxxx', email: 'sarah@email', billingId: '778899', selected: false },
      { company_name: 'John', phone_number: 'xxx-xxx-xxxx', email: 'john@email', billingId: '123456', selected: false }
    ];

    // Fetch customers from API and add them to the list
    this.customerService.getCustomers().subscribe(apiCustomers => {
      const formatted = apiCustomers.map(c => ({
        ...c,
        selected: false // Add the "selected" field for consistency
      }));
      this.customers = [...this.customers, ...formatted];
    });
  }

  addCustomer() {
    this.router.navigate(['/customers/create']);
  }

  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.customers.forEach(customer => customer.selected = checked);
  }
}
