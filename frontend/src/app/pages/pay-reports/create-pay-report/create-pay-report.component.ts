// create-pay-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PayReportsService, Driver } from 'src/app/services/pay-reports.service';

@Component({
  selector: 'app-create-pay-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-pay-report.component.html'
})
export class CreatePayReportComponent implements OnInit {
  saving = false;
  errorMsg = '';
  successMsg = '';

  drivers: { id: number; name: string }[] = [];
  loadingDrivers = false;
  driverQuery = '';

  form = this.fb.group({
    weekStart: ['', Validators.required],
    weekEnd:   ['', Validators.required],
    driverId:  [null as number | null, Validators.required],   // ← use id
  });

  constructor(private fb: FormBuilder, private svc: PayReportsService, private router: Router) {}

  ngOnInit(): void {
    this.fetchDrivers();
  }

  private fetchDrivers(): void {
    this.loadingDrivers = true;
    this.svc.listDrivers()
      .pipe(finalize(() => (this.loadingDrivers = false)))
      .subscribe({
        next: (list) => (this.drivers = this.normalizeDrivers(list)),
        error: () => { this.errorMsg = 'Could not load drivers.'; this.drivers = []; }
      });
  }

  private normalizeDrivers(list: Driver[] = []): { id: number; name: string }[] {
    return (list || [])
      .map((d: Driver | any) => {
        const id = d?.id ?? d?.driver_id;
        const name = (d?.name ?? [d?.first_name, d?.last_name].filter(Boolean).join(' ')).trim();
        return { id, name: name || 'Unnamed' };
      })
      .filter(d => d.id != null);
  }

  filteredDrivers(): { id: number; name: string }[] {
    const q = this.driverQuery.trim().toLowerCase();
    return !q ? this.drivers : this.drivers.filter(d => d.name.toLowerCase().includes(q));
  }

  save(): void {
    this.errorMsg = '';
    this.successMsg = '';

    const { weekStart, weekEnd, driverId } = this.form.getRawValue();

    if (!weekStart || !weekEnd) {
      this.errorMsg = 'Please select a week range.';
      return;
    }
    if (weekStart > weekEnd) {
      this.form.controls.weekEnd.setErrors({ range: true });
      this.errorMsg = 'End date must be on or after start date.';
      return;
    }
    if (!driverId) {
      this.errorMsg = 'Please select a driver.';
      return;
    }

    this.saving = true;
    this.svc.createReportResponse({ weekStart, weekEnd, driverId })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (resp) => {
          let id = resp.body?.id as number | undefined;
          if (!id) {
            const loc = resp.headers.get('Location') || resp.headers.get('location');
            id = loc?.match(/\/pay-reports\/(\d+)/i)?.[1] ? Number(RegExp.$1) : undefined;
          }
          if (!id) {
            this.errorMsg = 'Report created but no ID returned. Please refresh the list.';
            return;
          }
          this.successMsg = 'Report created.';
          this.router.navigate(['/pay-reports', id]);
        },
        error: (err) => {
          console.error('[CreateReport] error', err);
          this.errorMsg = err?.error?.message || 'Unable to create report. Please try again.';
        }
      });
  }

  cancel(): void { this.router.navigate(['/pay-reports']); }
}
