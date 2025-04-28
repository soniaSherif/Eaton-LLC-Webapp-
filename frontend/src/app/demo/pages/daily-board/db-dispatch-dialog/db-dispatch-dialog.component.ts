import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobDriverAssignmentService } from 'src/app/services/job-driver-assignment.service';

export interface DispatchDialogData {
  selectedJob: any;
}

@Component({
  selector: 'app-db-dispatch-dialog',
  standalone: true,               // make it standalone
  imports: [CommonModule, FormsModule],
  templateUrl: './db-dispatch-dialog.component.html',
  styleUrls: ['./db-dispatch-dialog.component.scss'],
  providers: [DatePipe]
})
export class DbDispatchDialogComponent implements OnInit {
  selectedJob: DispatchDialogData['selectedJob'];

  // ← new array to back your *ngFor="let dta of driverTruckAssignments"
  driverTruckAssignments: any[] = [];

  // ← bind to this instead of chosenDriver / chosenTruck
  chosenDTAId: number | null = null;
  chosenTime = '';

  constructor(
    public dialogRef: MatDialogRef<DbDispatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: DispatchDialogData,
    private datePipe: DatePipe,
    private dispatchSvc: JobDriverAssignmentService
  ) {
    this.selectedJob = data.selectedJob;
  }

  ngOnInit() {
    // loads only drivers-with-trucks
    this.dispatchSvc
      .listActiveDriverTrucks()
      .subscribe(list => (this.driverTruckAssignments = list));
  }

  get selectedTruckNumber(): string {
    const dta = this.driverTruckAssignments.find(d => d.id === this.chosenDTAId);
    return dta ? dta.truck_type : '';
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  submitForm() {
    if (!this.chosenDTAId || !this.chosenTime) return;

    this.dispatchSvc
      .dispatchToJob({
        job: this.selectedJob.id,
        driver_truck: this.chosenDTAId,
        assigned_at: `${this.selectedJob.date}T${this.chosenTime}`
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: err => console.error(err)
      });
  }

  getJobDate() {
    return this.datePipe.transform(this.selectedJob.date, 'MMMM d, yyyy')!;
  }
}
