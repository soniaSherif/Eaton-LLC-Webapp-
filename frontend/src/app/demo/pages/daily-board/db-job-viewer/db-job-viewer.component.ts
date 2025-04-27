import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }            from '@angular/common';
import { ActivatedRoute }          from '@angular/router';

@Component({
  selector: 'app-db-job-viewer',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './db-job-viewer.component.html',
  styleUrls: ['./db-job-viewer.component.scss']
})
export class DbJobViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  jobNumber: string | null = null;

  selectedJob: any = null;

  ngOnInit() {
    // Grab the jobNumber parameter from the route
    this.jobNumber = this.route.snapshot.paramMap.get('jobNumber');

     // Find the job with the matching job number
    this.selectedJob = this.jobs.find(job => job.jobNumber === this.jobNumber);

  // Only run these if the job is found
    if (this.selectedJob) {
      this.loadingOptionKeys = Object.keys(this.selectedJob.loading.options);
      this.unloadingOptionKeys = Object.keys(this.selectedJob.unloading.options);
    }
  }



  jobs = [
    {
      jobNumber: "J202501",
      projectName: 'Highway 52 Expansion Phase 2',
      primeContractor: 'Eaton RAD Infrastructure',
      primeContractorProjectNumber: 'ER-2048-H52',
      contractorToBeInvoiced: 'Twin Cities Haulers Inc.',
      contractorToBeInvoicedProjectNumber: 'TCH-8821-H52',
      jobType: 'Prevailing',
      reportingRequirement: 'AASHTOWare',
      contractNumber: 'CT-009873',
      projectIdNumber: 'PRJ-H52-EXP-P2',
      ratesByClassCode: [
        {
          code: 602,
          class: 'Operator A',
          baseRate: 32.5,
          fringeRate: 15.2,
          stdTimeRate: 47.7,
          otRate: 71.55
        },
        {
          code: 604,
          class: 'Driver B',
          baseRate: 28.0,
          fringeRate: 12.75,
          stdTimeRate: 40.75,
          otRate: 61.13
        },
        {
          code: 607,
          class: 'Flagman',
          baseRate: 22.5,
          fringeRate: 10.0,
          stdTimeRate: 32.5,
          otRate: 48.75
        }
      ],
      materialToBeMoved: 'Gravel & Asphalt Mix',
      invoicingRates: [
        { type: 'Belly Dump', unit: 'load', rate: 110 },
        { type: 'Side Dump', unit: 'load', rate: 105 },
        { type: 'End Dump', unit: 'load', rate: 100 },
        { type: 'Quint Axle', unit: 'hour', rate: 130 },
        { type: 'Quad Axle', unit: 'hour', rate: 120 },
        { type: 'Tri Axle', unit: 'hour', rate: 115 }
      ],
      payRates: [
        { type: 'Belly Dump', unit: 'load', rate: 95 },
        { type: 'Quad Axle', unit: 'hour', rate: 105 }
      ],
      date: '2025-04-18',
      startTime: '07:00 AM',
      loading: {
        address: '420 Quarry Ave, Rochester, MN',
        options: {
          logWeight: 'Required',
          ticketNumber: 'Required',
          ticketPhoto: 'Optional',
          signature: 'Required',
          trackLoadingTime: 'Optional'
        }
      },
      unloading: {
        address: '775 County Rd B, Inver Grove Heights, MN',
        options: {
          logWeight: 'Required',
          ticketNumber: 'Optional',
          ticketPhoto: 'Required',
          signature: 'Required'
        }
      },
      backhaul: true,
      backhaulInfo: {
        loadingAddress: '200 Industrial Ln, Eagan, MN',
        unloadingAddress: '114 Depot St, Mankato, MN'
      },
      jobForeman: [
        { name: 'Terry Walsh', phone: '(612) 555-2048' },
        { name: 'Lisa Tran', phone: '(651) 555-8821' }
      ],      
      notes: 'Foreman should review all unloading tickets before end-of-day. Note extra load expected due to surplus from previous phase.'
    }
  ];

  loadingOptionKeys: string[] = [];
  unloadingOptionKeys: string[] = [];
  

}
