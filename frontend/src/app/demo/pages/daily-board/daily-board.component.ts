import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common'; // Import CommonModule for directives like ngFor, ngIf
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-daily-board',
  templateUrl: './daily-board.component.html',
  styleUrls: ['./daily-board.component.scss'],
  standalone: true,  // Mark the component as standalone
  imports: [CommonModule, MatCardModule, MatTableModule, MatTooltipModule],  // Import required modules
})
export class DailyBoardComponent {
  jobs = [
    {
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
          startTime: "2025-04-02T08:00:00",
          truckName: "Truck 101",
          driverName: "Mike Johnson",
          driverPhone: "555-123-4567"
        },
        {
          startTime: "2025-04-02T09:30:00",
          truckName: "Truck 202",
          driverName: "Sarah Lee",
          driverPhone: "555-987-6543"
        }
      ]
    },
    {
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
          startTime: "2025-04-02T07:45:00",
          truckName: "Truck 303",
          driverName: "Emily Davis",
          driverPhone: "555-222-3333"
        }
      ]
    }
  ];
}
