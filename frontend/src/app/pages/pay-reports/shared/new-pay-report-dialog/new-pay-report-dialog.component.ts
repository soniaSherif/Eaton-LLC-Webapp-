import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewPayReportResult {
  driverId: number;
  weekStart: string;
  weekEnd: string;
}

export interface DialogDriver {
  id: number;
  name: string;
}

@Component({
  selector: 'app-new-pay-report-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-pay-report-dialog.component.html',
  styleUrls: ['./new-pay-report-dialog.component.scss']
})
export class NewPayReportDialogComponent {
  @Input({ required: true }) drivers: DialogDriver[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewPayReportResult>();

  driverQuery = '';
  selectedDriverId: number | null = null;
  weekStart = this.today();
  weekEnd = this.plusDays(6);

  filteredDrivers(): DialogDriver[] {
    const q = this.driverQuery.trim().toLowerCase();
    return !q ? this.drivers : this.drivers.filter(d => d.name.toLowerCase().includes(q));
  }

  canSave(): boolean {
    return this.selectedDriverId != null && !!this.weekStart && !!this.weekEnd;
  }

  doSave(): void {
    if (!this.canSave() || this.selectedDriverId == null) return;
    this.save.emit({ driverId: this.selectedDriverId, weekStart: this.weekStart, weekEnd: this.weekEnd });
  }

  today(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  plusDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}
