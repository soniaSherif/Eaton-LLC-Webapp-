import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subscription, switchMap, tap, catchError, of } from 'rxjs';
import { PayReportLine } from 'src/app/models/pay-report.model';
import { JobsService, PayReportsService, JobLite } from '../../../services/pay-reports.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-line-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-line-modal.component.html',
  styleUrls: ['./add-line-modal.component.scss']
})
export class AddLineModalComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Input() reportId!: number;
  @Input() weekStart!: string;   // "YYYY-MM-DD"
  @Input() weekEnd!: string;

  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<PayReportLine>();

  jobLoading = false;
  jobError = '';
  saving = false;
  selectedJobId: number | null = null;

  suggestions: JobLite[] = [];
  showSuggestions = false;

  private subs = new Subscription();

  form = this.fb.group({
    jobNumber: ['', Validators.required],
    truckNumber: ['', Validators.required],
    trailerNumber: ['', Validators.required],

    loaded: ['', Validators.required],
    unloaded: ['', Validators.required],
    weightOrHour: [0],
    truckPaid: [0],
    total: [0],
    trailerRent: [0],
    brokerCharge: [0],
    contractorPaid: [0]
  });

  constructor(
    private fb: FormBuilder,
    private jobs: JobsService,
    private reports: PayReportsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Prefill jobNumber suggestions; no date picker (week shown at top)

    // --- Live job search for suggestions (typeahead) ---
    const suggestSub = this.form.controls.jobNumber.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => { this.showSuggestions = false; this.jobError = ''; }),
      filter(v => !!v && String(v).trim().length >= 2),
      switchMap((q: string) =>
        this.jobs.search(q.trim()).pipe(
          catchError(() => of([] as JobLite[]))
        )
      )
    ).subscribe(list => {
      this.suggestions = list;
      this.showSuggestions = list.length > 0;
    });

    // --- Auto-fill from exact job number (convenience) ---
    const autoFillSub = this.form.controls.jobNumber.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(v => !!v && String(v).trim().length >= 2),
      tap(() => { this.jobLoading = true; this.jobError = ''; }),
      switchMap(jobNo =>
        this.jobs.getByJobNumber(String(jobNo).trim()).pipe(
          catchError(() => of(null)),
          tap(() => this.jobLoading = false)
        )
      )
    ).subscribe(job => {
      if (job) this.applyJobAutoFill(job);
    });

    // --- Preview totals on client (server remains source of truth) ---
    const recompute = this.form.valueChanges.subscribe(v => {
      const weight = Number(v?.weightOrHour) || 0;
      const rate = Number(v?.truckPaid) || 0;
      const total = Number(v?.total) || (weight * rate);
      this.form.patchValue({ total }, { emitEvent: false });
    });

    this.subs.add(suggestSub);
    this.subs.add(autoFillSub);
    this.subs.add(recompute);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ---- UI helpers ----
  trackByJobId = (_: number, j: JobLite) => j.id;

  onJobFieldBlur() {
    // small delay so click on suggestion can register before closing
    setTimeout(() => this.showSuggestions = false, 150);
  }

  pickSuggestion(job: JobLite) {
    // Set the job number (triggers auto-fill stream) and apply snapshots immediately
    this.form.patchValue({ jobNumber: job.job_number }, { emitEvent: true });
    this.applyJobAutoFill(job);
    this.showSuggestions = false;
  }

  private applyJobAutoFill(job: JobLite | any) {
    this.selectedJobId = job?.id ?? job?.job_id ?? null;
    const loaded = job.loading_address_info
      ? (job.loading_address_info.location_name || job.loading_address_info.street_address || '')
      : '';
    const unloaded = job.unloading_address_info
      ? (job.unloading_address_info.location_name || job.unloading_address_info.street_address || '')
      : '';

    const basePatch: any = { loaded, unloaded };
    const controlNames = Object.keys(this.form.controls);
    for (const key of controlNames) {
      if (key in job) basePatch[key] = job[key];
    }
    if (job.defaultTruckPaid != null && basePatch.truckPaid == null) basePatch.truckPaid = Number(job.defaultTruckPaid) || 0;
    if (job.defaultTrailerRent != null && basePatch.trailerRent == null) basePatch.trailerRent = Number(job.defaultTrailerRent) || 0;
    if (job.defaultBrokerCharge != null && basePatch.brokerCharge == null) basePatch.brokerCharge = Number(job.defaultBrokerCharge) || 0;
    if (job.defaultContractorPaid != null && basePatch.contractorPaid == null) basePatch.contractorPaid = Number(job.defaultContractorPaid) || 0;

    this.form.patchValue(basePatch, { emitEvent: false });
  }

  // ---- Modal controls ----
  close(): void {
    this.closed.emit();
  }

  // ---- Save line ----
  save(navigateAfter = false): void {
    if (this.form.invalid || !this.reportId) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.jobError = '';

    const todayIso = new Date().toISOString().slice(0, 10);
    const date = this.weekStart || todayIso;
    const jobNumber = (this.form.value.jobNumber || '').trim();
    const truckNumber = (this.form.value.truckNumber || '').trim();
    const trailerNumber = (this.form.value.trailerNumber || '').trim();
    const loaded = (this.form.value.loaded || '').trim();
    const unloaded = (this.form.value.unloaded || '').trim();

    if (!jobNumber || !truckNumber || !trailerNumber || !loaded || !unloaded) {
      this.saving = false;
      this.jobError = 'Job, truck, trailer, loaded, and unloaded are required.';
      return;
    }

    // Backend expects PayReportLine fields
    const payload: any = {
      date, // align with report week (no date picker)
      job: this.selectedJobId ?? undefined,
      job_number: jobNumber,
      truck_number: truckNumber,
      trailer_number: trailerNumber,
      loaded,
      unloaded,
      weight_or_hour: Number(this.form.value.weightOrHour) || 0,
      truck_paid: Number(this.form.value.truckPaid) || 0,
      trailer_rent: Number(this.form.value.trailerRent) || 0,
      broker_charge: Number(this.form.value.brokerCharge) || 0,
      // total/contractor_paid are computed server-side
    };

    // Use top-level pay-report-lines endpoint
    this.reports.createLineTop(this.reportId, payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.created.emit(created);
        if (navigateAfter) {
          this.router.navigate(['/pay-reports', this.reportId]);
        }
        this.close();
      },
      error: (err) => {
        this.saving = false;
        const e = err?.error;
        const pick = (o: any, keys: string[]) => {
          for (const k of keys) {
            if (o && o[k]) return Array.isArray(o[k]) ? o[k][0] : o[k];
          }
          return '';
        };
        const msg =
          pick(e, ['detail', 'non_field_errors', 'report', 'job', 'job_number', 'truck_number', 'trailer_number', 'loaded', 'unloaded', 'date']) ||
          'Unable to save. Please try again.';
        this.jobError = msg;
        console.error('[AddLine] save failed', err);
      }
    });
  }

  createAndReturn(): void {
    this.save(true);
  }
}
