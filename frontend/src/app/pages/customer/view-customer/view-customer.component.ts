import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-customer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-customer.component.html',
  styleUrl: './view-customer.component.scss'
})
export class ViewCustomerComponent implements OnInit {
  customerId: number | null = null;
  customer: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
    this.error = null;
    
    this.customerService.getCustomerById(id)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load customer. Please try again.';
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load customer',
            toast: true,
            position: 'bottom-end',
            timer: 3000,
            showConfirmButton: false
          });
          return of(null);
        })
      )
      .subscribe(customer => {
        if (customer) {
          this.customer = customer;
        } else {
          this.router.navigate(['/customers']);
        }
        this.loading = false;
      });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  editCustomer(): void {
    if (this.customerId) {
      this.router.navigate(['/customers/edit', this.customerId]);
    }
  }
}

