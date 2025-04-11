import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog service
import { DispatchDialogComponent } from '../dispatch/dispatch-dialog/dispatch-dialog.component'; // Corrected import path

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
    MatDialogModule // Use MatDialogModule here
  ],  
  providers: [DatePipe] // Add DatePipe to the providers array
})
export class DailyBoardComponent implements OnInit {
  constructor(private datePipe: DatePipe, private dialog: MatDialog) {} // Inject MatDialog service

  selectedDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

  jobs = [
    {
      date: "2025-04-10",
      jobName: "Highway Expansion",
      jobNumber: "J202501",
      material: "Asphalt",
      startLocation: "Site A",
      endLocation: "Site B",
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

  // Open the dispatch dialog when the user clicks on a row
  openDialog(): void {
    const dialogRef = this.dialog.open(DispatchDialogComponent, {
      width: '400px', // Set dialog width
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
      }
    });
  }
}
