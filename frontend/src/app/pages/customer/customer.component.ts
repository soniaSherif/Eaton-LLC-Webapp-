import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Subscription, filter, catchError, of, forkJoin } from 'rxjs';

type CustomerRow = {
  id?: number;
  company_name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  selected?: boolean;
};

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy {
  // UI state
  selected: CustomerRow[] = [];
  loading = false;
  error: string | null = null;
  private routerSubscription?: Subscription;

  // Filter state
  filters = {
    search: '' // Search by company name, email, or phone
  };

  // Backing data
  private all: CustomerRow[] = [];

  // Table data (filtered view)
  customers: CustomerRow[] = [];

  constructor(
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    
    // Reload customers when returning to this page
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      if (url === '/customers' || url.startsWith('/customers') && !url.includes('/create') && !url.includes('/edit')) {
        setTimeout(() => {
          this.loadCustomers();
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Load customers from API
  private loadCustomers(): void {
    this.loading = true;
    this.error = null;

    this.customerService.getCustomers()
      .pipe(
        catchError(err => {
          this.error = 'Failed to load customers. Please try again.';
          this.loading = false;
          console.error('Error loading customers:', err);
          return of([]);
        })
      )
      .subscribe(apiCustomers => {
        // Map API response to CustomerRow format - only include customers with IDs from API
        this.all = apiCustomers
          .filter(c => c.id) // Only include customers with IDs (from database)
          .map(c => ({
            id: c.id,
            company_name: c.company_name || '',
            phone_number: c.phone_number || '',
            email: c.email || '',
            address: c.address || '',
            city: c.city || '',
            selected: false
          } as CustomerRow));
        
        // Sort by company name
        this.all.sort((a, b) => a.company_name.localeCompare(b.company_name));
        
        this.applyFilters();
        this.loading = false;
      });
  }

  // ngFor performance
  trackById = (_: number, r: CustomerRow) => r.id || 0;

  // Refresh selection after checkbox changes
  onSelect(): void {
    this.selected = this.customers.filter(r => !!r.selected);
  }

  // Multi-field filter
  applyFilters(): void {
    const searchTerm = this.filters.search.toLowerCase().trim();

    let filtered = this.all;

    if (searchTerm) {
      filtered = this.all.filter(r => {
        const matchesName = r.company_name?.toLowerCase().includes(searchTerm) || false;
        const matchesEmail = r.email?.toLowerCase().includes(searchTerm) || false;
        const matchesPhone = r.phone_number?.toLowerCase().includes(searchTerm) || false;
        const matchesAddress = r.address?.toLowerCase().includes(searchTerm) || false;
        const matchesCity = r.city?.toLowerCase().includes(searchTerm) || false;
        return matchesName || matchesEmail || matchesPhone || matchesAddress || matchesCity;
      });
    }

    this.customers = filtered;
    this.onSelect();
  }

  // Navigation actions
  view(id: number | undefined): void {
    if (id) {
      // Navigate to view-only page
      this.router.navigate(['/customers/view', id]);
    }
  }

  edit(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/customers/edit', id]);
    }
  }

  // Delete single customer
  delete(id: number | undefined): void {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    this.loading = true;
    this.error = null;
    
    this.customerService.deleteCustomer(id)
      .pipe(
        catchError(err => {
          this.error = 'Failed to delete customer. Please try again.';
          this.loading = false;
          console.error('Error deleting customer:', err);
          return of(null);
        })
      )
      .subscribe(() => {
        // Reload customers after deletion
        this.loadCustomers();
        this.loading = false;
      });
  }

  // Bulk delete
  deleteSelected(): void {
    if (!this.selected.length) return;
    if (!confirm(`Are you sure you want to delete ${this.selected.length} selected customer(s)?`)) return;
    
    this.loading = true;
    this.error = null;
    
    const ids = this.selected.filter(s => s.id).map(s => s.id!);
    const deleteObservables = ids.map(id => 
      this.customerService.deleteCustomer(id).pipe(
        catchError(err => {
          console.error(`Error deleting customer ${id}:`, err);
          return of(null);
        })
      )
    );

    // Execute all deletes in parallel using forkJoin
    forkJoin(deleteObservables)
      .pipe(
        catchError(err => {
          this.error = 'Some customers could not be deleted. Please try again.';
          this.loading = false;
          console.error('Error in bulk delete:', err);
          return of([]);
        })
      )
      .subscribe(() => {
        // Reload customers after deletion
        this.loadCustomers();
        this.selected = [];
        this.loading = false;
      });
  }

  addCustomer() {
    this.router.navigate(['/customers/create']);
  }

  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.customers.forEach(customer => customer.selected = checked);
    this.onSelect();
  }
}
