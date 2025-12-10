import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { PayReport, PayReportLine } from 'src/app/models/pay-report.model';
import { PayReportsService } from 'src/app/services/pay-reports.service';
import { AddLineModalComponent } from '../add-line/add-line-modal.component';

type NumericLineKeys =
  | 'weightOrHour'
  | 'truckPaid'
  | 'total'
  | 'trailerRent'
  | 'brokerCharge'
  | 'contractorPaid';

@Component({
  selector: 'app-open-pay-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AddLineModalComponent],
  templateUrl: './open-pay-report.component.html',
  styleUrls: ['./open-pay-report.component.scss']
})
export class OpenPayReportComponent implements OnInit {
  @ViewChild('reportArea') reportArea?: ElementRef<HTMLElement>;

  id!: number;
  report!: PayReport;

  // UI state
  loading = false;
  loadingLines = false;
  savingHeader = false;
  errorMsg = '';

  // modal + inline edit
  addOpen = false;
  isEditing = false;
  editingLine: PayReportLine | null = null;

  constructor(private route: ActivatedRoute, private svc: PayReportsService) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const qp = this.route.snapshot.queryParamMap;

    this.fetchReport(() => {
      if (qp.get('add') === '1') {
        // open after the first change detection so the dialog sees inputs
        setTimeout(() => this.openAddModal(), 0);
      }
    });
  }

  // ------------------ Data loading ------------------

  private fetchReport(after?: () => void): void {
    this.loading = true;
    this.errorMsg = '';

    this.svc.getReport(this.id).subscribe({
      next: (r) => {
        this.report = this.normalizeReport(r as any);
        this.loading = false;
        this.fetchLines();
        if (after) after();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.detail || 'Unable to load pay report.';
      }
    });
  }

  private normalizeReport(r: any): PayReport {
    return {
      ...r,
      driverName: r?.driverName ?? r?.driver_name ?? '',
      weekStart: r?.weekStart ?? r?.week_start ?? '',
      weekEnd: r?.weekEnd ?? r?.week_end ?? '',
      fuelProgram: r?.fuelProgram ?? r?.fuel_program ?? 0,
      fuelPilotOrKT: r?.fuelPilotOrKT ?? r?.fuel_pilot_or_kt ?? 0,
      fuelSurcharge: r?.fuelSurcharge ?? r?.fuel_surcharge ?? 0,
      totalWeightOrHours: r?.totalWeightOrHours ?? r?.total_weight_or_hours ?? 0,
      totalTruckPaid: r?.totalTruckPaid ?? r?.total_truck_paid ?? 0,
      totalAmount: r?.totalAmount ?? r?.total_amount ?? 0,
      totalDue: r?.totalDue ?? r?.total_due ?? 0,
    } as PayReport;
  }

  private fetchLines(): void {
    this.loadingLines = true;
    this.svc.listLines(this.id).subscribe({
      next: (lines) => {
        // some backends return null; normalize
        this.report.lines = (lines || []) as PayReportLine[];
        this.recalculateTotals(); // keep header totals consistent with lines
        this.loadingLines = false;
      },
      error: () => {
        this.report.lines = [];
        this.loadingLines = false;
      }
    });
  }

  // ------------------ Modal open/close ------------------

  openAddModal(): void { this.addOpen = true; }
  onModalClosed(): void { this.addOpen = false; }

  // When AddLineModal emits a created line
  onLineCreated(line: PayReportLine): void {
    // Refresh from API to pick up recomputed header totals and normalized fields
    this.addOpen = false;
    this.fetchReport();
  }

  // ------------------ Inline edit ops ------------------

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.editingLine = null;
  }

  editLineItem(line: PayReportLine): void {
    this.isEditing = true;
    this.editingLine = { ...line };
  }

  saveLineItem(): void {
    if (!this.editingLine || !this.report) return;

    // auto-calc the row total
    const w = Number(this.editingLine.weightOrHour) || 0;
    const p = Number(this.editingLine.truckPaid) || 0;
    this.editingLine.total = w * p;

    // optimistic update UI
    const idx = this.report.lines.findIndex(l => l.id === this.editingLine!.id);
    if (idx !== -1) {
      this.report.lines[idx] = { ...this.editingLine };
      this.recalculateTotals();
    }

    // persist
    if (this.editingLine.id) {
      this.svc.updateLineTop(this.editingLine.id, this.editingLine).subscribe({
        error: () => console.error('[OpenPayReport] failed to update line')
      });
    }

    this.editingLine = null;
  }

  cancelEditLineItem(): void {
    this.editingLine = null;
  }

  deleteLineItem(line: PayReportLine): void {
    if (!this.report || !line?.id) return;
    if (!confirm('Are you sure you want to delete this line item?')) return;

    // optimistic remove
    this.report.lines = (this.report.lines || []).filter(l => l.id !== line.id);
    this.recalculateTotals();

    this.svc.deleteLineTop(line.id).subscribe({
      error: () => console.error('[OpenPayReport] failed to delete line')
    });
  }

  // ------------------ Header save (future) ------------------

  saveReport(): void {
    // If/when you add PATCH for header: set saving flag, call svc, then clear/edit off.
    // this.savingHeader = true;
    // this.svc.updateHeader(this.id, { ...fields }).pipe(finalize(() => this.savingHeader = false)).subscribe(...)
    this.isEditing = false;
  }

  // ------------------ Totals ------------------

  private recalculateTotals(): void {
    if (!this.report) return;

    const sum = (key: keyof PayReportLine) =>
      (this.report.lines || []).reduce((s, l) => s + (Number(l[key]) || 0), 0);

    this.report.totalWeightOrHours = sum('weightOrHour');
    this.report.totalTruckPaid     = sum('truckPaid');   // note: backend stores max, UI uses sum for quick view
    this.report.totalAmount        = sum('total');

    // Match backend calculation:
    // total_due = total_amount - fuel_program - fuel_pilot_or_kt + fuel_surcharge
    const fp  = Number(this.report.fuelProgram)   || 0;
    const fpk = Number(this.report.fuelPilotOrKT) || 0;
    const fs  = Number(this.report.fuelSurcharge) || 0;

    this.report.totalDue = this.report.totalAmount - fp - fpk + fs;
  }

  sum = (key: NumericLineKeys): number =>
    (this.report?.lines ?? []).reduce((s, l) => s + (Number(l[key]) || 0), 0);

  // ------------------ trackBy ------------------

  trackByLineId = (_: number, line: PayReportLine) => line.id ?? -1;

  // ------------------ Export: PDF ------------------

  async exportPdf(): Promise<void> {
    if (!this.reportArea) return;
    const el = this.reportArea.nativeElement;

    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth  = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      let remaining = imgHeight;
      let offset = 0;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, -offset, imgWidth, imgHeight, undefined, 'FAST');
        remaining -= pageHeight;
        offset += pageHeight;
        if (remaining > 0) pdf.addPage();
      }
    }

    const filename = `pay-report-${this.report?.driverName || this.id}.pdf`;
    pdf.save(filename);
  }

  // ------------------ Export: CSV ------------------

  exportCsv(): void {
    if (!this.report) return;

    const header = [
      'Date',
      'Truck #',
      'Trailer #',
      'Job #',
      'Loaded',
      'Unloaded',
      'Weight/Hour',
      'Truck Paid',
      'Total',
      'Trailer Rent',
      'Broker Charge',
      'Contractor Paid'
    ];

    const rows = (this.report.lines || []).map(l => [
      l.date,
      l.truckNumber,
      l.trailerNumber ?? '',
      l.jobNumber,
      safe(l.loaded),
      safe(l.unloaded),
      num(l.weightOrHour),
      num(l.truckPaid),
      num(l.total),
      num(l.trailerRent),
      num(l.brokerCharge),
      num(l.contractorPaid)
    ]);

    // totals row
    rows.push([]);
    rows.push(['', '', '', '', '', 'Totals',
      num(this.sum('weightOrHour')),
      num(this.sum('truckPaid')),
      num(this.sum('total')),
      num(this.sum('trailerRent')),
      num(this.sum('brokerCharge')),
      num(this.sum('contractorPaid'))
    ]);

    // footer like the PDF
    rows.push(['', '', '', '', '', 'Fuel Program',   '', '', '', '', '', num(this.report.fuelProgram)]);
    rows.push(['', '', '', '', '', 'Fuel - Pilot/KT','', '', '', '', '', num(this.report.fuelPilotOrKT)]);
    rows.push(['', '', '', '', '', 'Fuel Surcharge', '', '', '', '', '', num(this.report.fuelSurcharge)]);
    rows.push(['', '', '', '', '', 'Total Due',      '', '', '', '', '', num(this.report.totalDue)]);

    const csv = [header, ...rows]
      .map(cols => cols.map(asCsv).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pay-report-${this.report.driverName || this.id}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);

    function num(v: any) { return v ?? 0; }
    function safe(v: any) { return v ?? ''; }
    function asCsv(v: any) {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }
  }
}
