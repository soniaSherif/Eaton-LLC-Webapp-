// db-job-viewer.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe }         from '@angular/common';
import { ActivatedRoute }                 from '@angular/router';
import { JobService }                     from 'src/app/services/job.service';

@Component({
  selector: 'app-db-job-viewer',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './db-job-viewer.component.html',
  styleUrls: ['./db-job-viewer.component.scss'],
  providers: [ DatePipe ]
})
export class DbJobViewerComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private datePipe   = inject(DatePipe);

  jobId: number | null        = null;
  selectedJob: any            = null;
  loadingOptionKeys: string[] = [];
  unloadingOptionKeys: string[] = [];

  ngOnInit() {
    // 1) Grab the numeric `id` from the URL
    const idParam = this.route.snapshot.paramMap.get('id');
    this.jobId = idParam ? +idParam : null;
    if (!this.jobId) return;

    // 2) Fetch by ID (not by jobNumber)
    this.jobService.getJobById(this.jobId)
      .subscribe(job => {
        // 3) Map fields exactly to what YOUR TEMPLATE expects:
        this.selectedJob = job;
  });
}
}
