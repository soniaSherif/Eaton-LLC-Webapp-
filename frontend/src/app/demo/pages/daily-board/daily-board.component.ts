import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog service
import { DbDispatchDialogComponent, DispatchDialogData } from './db-dispatch-dialog/db-dispatch-dialog.component';
import { RouterModule } from '@angular/router';


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
  constructor(private datePipe: DatePipe, private dialog: MatDialog) {} // Inject MatDialog service

  selectedDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

  jobs = [
    {
      date: "2025-04-18",
      jobName: "Highway Expansion",
      jobNumber: "J202501",
      material: "Asphalt",
      startLocation: "5500 Wayzata Blvd, Golden Valley, MN 55416",
      endLocation: "4201 W 78th St, Bloomington, MN 55435",
      foremen: [
        { name: "John Doe", phone: "555-111-2222" },
        { name: "Jane Smith", phone: "555-333-4444" }
      ],
      assignments: [
        {
          startTime: "08:00",
          truckName: "Truck 101",
          driverName: "Mike Johnson",
          driverPhone: "555-123-4567"
        },
        {
          startTime: "09:30",
          truckName: "Truck 202",
          driverName: "Sarah Lee",
          driverPhone: "555-987-6543"
        }
      ]
    },
    {
      date: "2025-04-03",
      jobName: "Warehouse Construction",
      jobNumber: "J202502",
      material: "Concrete",
      startLocation: "Plant X",
      endLocation: "Warehouse Y",
      foremen: [
        { name: "Robert Brown", phone: "555-555-6666" }
      ],
      assignments: [
        {
          startTime: "07:45",
          truckName: "Truck 303",
          driverName: "Emily Davis",
          driverPhone: "555-222-3333"
        }
      ]
    }
  ];

  drivers = ['Driver 1', 'Driver 2', 'Driver 3'];
  trucks = ['Truck 1', 'Truck 2', 'Truck 3'];
  
  filteredJobs = this.jobs;

  filterJobs() {
    if (this.selectedDate) {
      this.filteredJobs = this.jobs.filter(job => job.date === this.selectedDate);
    } else {
      this.filteredJobs = this.jobs;
    }
  }

  ngOnInit() {
    this.filterJobs();
  }

 //open dialog and pass the data over at same time
  openDialog(aJobNumber): void {

    // Find the job with the matching job number
    const selectedJob = this.jobs.find(job => job.jobNumber === aJobNumber);
    const dialogRef = this.dialog.open<
      DbDispatchDialogComponent,
      DispatchDialogData,
      any
    >(DbDispatchDialogComponent, {
      width: '400px',
      data: {
        selectedJob, 
        drivers: this.drivers,
        trucks:  this.trucks
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
      }
    });
  }
}
