import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog service
import { DbDispatchDialogComponent, DispatchDialogData } from './db-dispatch-dialog/db-dispatch-dialog.component';
import { Router, RouterModule } from '@angular/router';
import { JobService } from 'src/app/services/job.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-daily-board',
  templateUrl: './daily-board.component.html',
  styleUrls: ['./daily-board.component.scss'],
  standalone: true, // Mark the component as standalone
  imports: [
    CommonModule, 
    MatCardModule, 
    MatTableModule, 
    MatTooltipModule, 
    FormsModule,
    RouterModule,
    MatDialogModule 
  ],  
  providers: [DatePipe] // Add DatePipe to the providers array
})
export class DailyBoardComponent implements OnInit {
  constructor(private router: Router, private jobService: JobService, private datePipe: DatePipe, private dialog: MatDialog) {} // Inject MatDialog service

  selectedDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

  drivers = ['Driver 1', 'Driver 2', 'Driver 3'];
  trucks = ['Truck 1', 'Truck 2', 'Truck 3'];
  
  jobs: any[] = [];
  filteredJobs: any[] = [];

  ngOnInit() {
     // load jobs for today's date on init
     this.applyFilter();   
  }
  applyFilter() {
    this.jobService.getJobsByDate(this.selectedDate).subscribe({
      next: jobs => {
        // keep the raw list for dispatching lookups
        this.jobs = jobs;

        // ensure each job has an assignments array
        this.filteredJobs = jobs.map(job => ({
          ...job,
          assignments: Array.isArray(job.driver_assignments) ? job.driver_assignments : []
        }));
      },
      error: err => console.error('Error fetching jobs by date', err)
    });
  }

  editJob(jobId: number) {
    console.log("pressed")
    this.router.navigate(['/job-edit', jobId]);
  }
 //open dialog and pass the data over at same time
 openDialog(aJobNumber: string): void {
  const selectedJob = this.jobs.find(job => job.jobNumber === aJobNumber);

  const dialogRef = this.dialog.open<
    DbDispatchDialogComponent,
    DispatchDialogData
  >(DbDispatchDialogComponent, {
    width: '400px',
    data: {
      selectedJob,
      // ← remove these:
      // drivers: this.drivers,
      // trucks:  this.trucks
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Dialog result:', result);
      // probably re-load your assignments here
      this.applyFilter();
    }
  });
}
 getStaticMapUrl(job: any): string | null {
  const key = environment.googleMapsKey;
  const o = job?.loading_address_info;
  const d = job?.unloading_address_info;

  if (!o || !d) {
    console.warn('Missing address info for job', job?.id, { o, d });
    return null;
  }

  const oLat = Number(o.latitude);
  const oLng = Number(o.longitude);
  const dLat = Number(d.latitude);
  const dLng = Number(d.longitude);

  if (
    Number.isNaN(oLat) || Number.isNaN(oLng) ||
    Number.isNaN(dLat) || Number.isNaN(dLng)
  ) {
    console.warn('Invalid coordinates for job', job?.id, { o, d });
    return null;
  }

  if (!key) {
    console.warn('Missing googleMapsKey in environment');
    return null;
  }

  const origin = `${oLat},${oLng}`;
  const dest   = `${dLat},${dLng}`;
  const size   = '640x360';
  const scale  = 2;

  const markers =
    `markers=color:green|label:S|${origin}` +
    `&markers=color:red|label:E|${dest}`;

  const path =
    `path=weight:5|color:0x1e88e5|${origin}|${dest}`;

  const url =
    `https://maps.googleapis.com/maps/api/staticmap?size=${size}` +
    `&scale=${scale}&maptype=roadmap&${markers}&${path}&key=${key}`;

  console.log('Static map URL for job', job?.id, url);
  return url;
}
}