import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PayReportsService } from '../../services/pay-reports.service';
import { NotificationService } from 'src/app/services/notification.service';
import { NewPayReportDialogComponent, NewPayReportResult } from './shared/new-pay-report-dialog/new-pay-report-dialog.component';
import { PayReportHeader } from 'src/app/models/pay-report.model';

type PayReportHeaderRow = PayReportHeader & { selected?: boolean };

// Local UI type for drivers (name may come as full name or first/last)
type DriverUI = { id: number; name?: string; first_name?: string; last_name?: string };

@Component({
  selector: 'app-pay-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, NewPayReportDialogComponent],
  templateUrl: './pay-reports.component.html',
  styleUrls: ['./pay-reports.component.scss']
})
export class PayReportsComponent implements OnInit {
  // filters bound in the template
  filters = { driver: '', from: '', to: '' };

  // backing store from API; we keep selection on these objects
  private allReports: PayReportHeaderRow[] = [];
  // table data
  reports: PayReportHeaderRow[] = [];
  selected: PayReportHeaderRow[] = [];

  // drivers for the new-report dialog
  drivers: { id: number; name: string }[] = [];
  showNewModal = false;

  constructor(private router: Router, private svc: PayReportsService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadFromApi();
    this.loadDrivers();
  }

  // ------- data loads -------
  private loadFromApi(): void {
    this.svc.list().subscribe({
      next: (list) => {
        const rows: PayReportHeaderRow[] = (list || []).map((h: any) => this.normalizeHeader(h));
        this.allReports = rows;
        this.applyFilters();
      },
      error: (err) => {
        console.error('[PayReports] list() failed:', err);
        // keep whatever we had, or show empty state
        this.reports = [...this.allReports];
      }
    });
  }

  private normalizeHeader(h: any): PayReportHeaderRow {
    return {
      id: h?.id ?? 0,
      driverId: h?.driver ?? h?.driver_id,
      driverName: h?.driverName ?? h?.driver_name ?? '',
      weekStart: h?.weekStart ?? h?.week_start ?? '',
      weekEnd: h?.weekEnd ?? h?.week_end ?? '',
      totalWeightOrHours: h?.totalWeightOrHours ?? h?.total_weight_or_hours ?? 0,
      totalTruckPaid: h?.totalTruckPaid ?? h?.total_truck_paid ?? 0,
      totalAmount: h?.totalAmount ?? h?.total_amount ?? 0,
      totalDue: h?.totalDue ?? h?.total_due ?? 0,
      selected: false
    };
  }

  private loadDrivers(): void {
    this.svc.listDrivers().subscribe({
      next: (list: DriverUI[] = []) => {
        // Safely derive display name; avoid ??/|| precedence issue by wrapping
        this.drivers = list.map((d) => ({
          id: (d as any).id ?? (d as any).driver_id,
          name: (d?.name ?? [d?.first_name, d?.last_name].filter(Boolean).join(' ')) || 'Unnamed'
        }));
      },
      error: (err) => {
        console.error('[PayReports] listDrivers() failed:', err);
        this.drivers = [];
      }
    });
  }

  // ------- table helpers -------
  trackById = (_: number, r: PayReportHeaderRow) => r.id;

  onSelect(): void {
    this.selected = this.reports.filter(r => !!r.selected);
  }

  applyFilters(): void {
    const d = (this.filters.driver || '').toLowerCase();
    const from = this.filters.from;
    const to = this.filters.to;

    this.reports = this.allReports.filter(r => {
      const mDriver = d ? (r.driverName || '').toLowerCase().includes(d) : true;
      const mFrom = from ? r.weekStart >= from : true; // ISO yyyy-mm-dd string compare
      const mTo   = to   ? r.weekEnd   <= to   : true;
      return mDriver && mFrom && mTo;
    });

    this.onSelect();
  }

  // ------- actions -------
  open(id: number): void {
    this.router.navigate(['/pay-reports', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/pay-reports', id], { queryParams: { add: '1' } });
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this pay report?')) return;
    this.svc.deleteReport(id).subscribe({
      next: () => {
        this.allReports = this.allReports.filter(r => r.id !== id);
        this.applyFilters();
        this.notify.add('Pay report deleted', 'success');
      },
      error: (err) => {
        console.error('[PayReports] deleteReport() failed:', err);
        this.notify.add('Failed to delete pay report', 'error');
      }
    });
  }

  deleteSelected(): void {
    if (this.selected.length === 0) return;
    const message = `Are you sure you want to delete ${this.selected.length} selected report(s)?`;
    if (!confirm(message)) return;
    const ids = new Set(this.selected.map(s => s.id));
    const deletions = Array.from(ids).map(id => this.svc.deleteReport(id));
    forkJoin(deletions).subscribe({
      next: () => {
        this.allReports = this.allReports.filter(r => !ids.has(r.id));
        this.selected = [];
        this.applyFilters();
        this.notify.add('Selected pay reports deleted', 'success');
      },
      error: (err) => {
        console.error('[PayReports] deleteSelected() failed:', err);
        this.notify.add('Failed to delete selected reports', 'error');
      }
    });
  }

  // ------- new report dialog -------
  openNewReportDialog(): void { this.showNewModal = true; }
  onCloseNew(): void { this.showNewModal = false; }

  onSaveNew(result: NewPayReportResult): void {
    this.showNewModal = false;
    const driverName = this.drivers.find(d => d.id === result.driverId)?.name ?? 'Driver';

    this.svc.createReport({
      weekStart: result.weekStart,
      weekEnd: result.weekEnd,
      driverId: result.driverId
    })
    .subscribe({
      next: (created: any) => {
        // reload list and navigate to the new report
        this.loadFromApi();
        const id = created?.id ?? 0;
        this.notify.add('Pay report created', 'success');
        this.router.navigate(
          ['/pay-reports', id],
          { queryParams: { driver: driverName, from: result.weekStart, to: result.weekEnd, add: '1' } }
        );
      },
      error: (err) => {
        console.error('[PayReports] createReport() failed:', err);
        // still refresh list to keep UI consistent
        this.loadFromApi();
        this.notify.add('Failed to create pay report', 'error');
      }
    });
  }
}
