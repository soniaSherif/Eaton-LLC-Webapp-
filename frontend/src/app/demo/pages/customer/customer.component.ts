import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Required for ngModel

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Ensure FormsModule is included
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  customers = [
    { name: 'Jake', phone: 'xxx-xxx-xxxx', email: 'test@email', billingId: '556653', selected: false },
    { name: 'Sarah', phone: 'xxx-xxx-xxxx', email: 'sarah@email', billingId: '778899', selected: false },
    { name: 'John', phone: 'xxx-xxx-xxxx', email: 'john@email', billingId: '123456', selected: false }
  ];

  // ✅ Fix: Define the missing method to add a customer
  addCustomer() {
    console.log('Adding a new customer...');
  }

  // ✅ Fix: Define the missing method to select/deselect all customers
  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.customers.forEach(customer => customer.selected = checked);
  }
}
