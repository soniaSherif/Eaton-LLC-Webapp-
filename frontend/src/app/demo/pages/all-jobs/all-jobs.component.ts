import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';  // Import the shared module


@Component({
  selector: 'app-all-jobs',
  templateUrl: './all-jobs.component.html',
  styleUrl: './all-jobs.component.scss',
  imports: [SharedModule],  // Include the shared module here
})
export class AllJobsComponent {
  jobs = [
    { jobId: '1234', project: 'I-94', schedule: 'May 16, 2023 - May 17, 2023', customer: 'AMES', material: 'SAND', ordered: '0 / Tons', selected: false },
    // Add more job data here
  ];

  // Select all checkboxes
  selectAll(event: any): void {
    const isChecked = event.target.checked;
    this.jobs.forEach(job => job.selected = isChecked);
  }

}
