import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';


export interface DispatchDialogData {
  selectedJob: { jobName: string; jobNumber: string; date: string };
  drivers: string[];
  trucks: string[];
}

@Component({
  selector: 'app-db-dispatch-dialog',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './db-dispatch-dialog.component.html',
  styleUrls: ['./db-dispatch-dialog.component.scss'],
  providers: [ DatePipe ]
})
export class DbDispatchDialogComponent {
  // Now just one job:
  selectedJob: DispatchDialogData['selectedJob'];
  drivers:     string[];
  trucks:      string[];

  // These will hold the user’s picks
  chosenDriver = '';
  chosenTruck  = '';
  chosenTime   = '';

  constructor(
    public dialogRef: MatDialogRef<DbDispatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: DispatchDialogData,
    private datePipe: DatePipe
  ) {
    this.selectedJob = data.selectedJob;
    this.drivers    = data.drivers;
    this.trucks     = data.trucks;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submitForm() {
    this.dialogRef.close({
      job:    this.selectedJob,
      driver: this.chosenDriver,
      truck:  this.chosenTruck,
      time:   this.chosenTime
    });
  }

  getJobDate(): string {
    return this.datePipe.transform(this.selectedJob.date, 'MMMM d, yyyy') || '';
  }
}