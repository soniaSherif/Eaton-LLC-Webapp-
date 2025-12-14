import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobService } from './job.service';
import { environment } from '../../environments/environment';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiBaseUrl + 'jobs/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobService]
    });
    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createJob', () => {
    it('should create a new job', () => {
      const jobData = {
        job_number: 'JOB-001',
        customer: 1,
        description: 'Test Job'
      };
      const mockResponse = { id: 1, ...jobData };

      service.createJob(jobData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jobData);
      req.flush(mockResponse);
    });
  });

  describe('getAllJobs', () => {
    it('should retrieve all jobs', () => {
      const mockJobs = [
        { id: 1, job_number: 'JOB-001', customer: 1 },
        { id: 2, job_number: 'JOB-002', customer: 2 }
      ];

      service.getAllJobs().subscribe(jobs => {
        expect(jobs).toEqual(mockJobs);
        expect(jobs.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockJobs);
    });
  });

  describe('getJobsByDate', () => {
    it('should retrieve jobs filtered by date', () => {
      const selectedDate = '2024-01-15';
      const mockJobs = [
        { id: 1, job_number: 'JOB-001', date: selectedDate }
      ];

      service.getJobsByDate(selectedDate).subscribe(jobs => {
        expect(jobs).toEqual(mockJobs);
      });

      const req = httpMock.expectOne(`${apiUrl}?date=${selectedDate}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockJobs);
    });
  });

  describe('getJobByNumber', () => {
    it('should retrieve a job by job number', () => {
      const jobNumber = 'JOB-001';
      const mockJob = { id: 1, job_number: jobNumber, customer: 1 };

      service.getJobByNumber(jobNumber).subscribe(job => {
        expect(job).toEqual(mockJob);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}jobs/${jobNumber}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockJob);
    });
  });

  describe('getJobById', () => {
    it('should retrieve a job by ID', () => {
      const jobId = 1;
      const mockJob = { id: jobId, job_number: 'JOB-001', customer: 1 };

      service.getJobById(jobId).subscribe(job => {
        expect(job).toEqual(mockJob);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}jobs/${jobId}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockJob);
    });
  });

  describe('updateJob', () => {
    it('should update an existing job', () => {
      const jobId = 1;
      const updateData = { description: 'Updated Description' };
      const mockResponse = { id: jobId, ...updateData };

      service.updateJob(jobId, updateData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}jobs/${jobId}/`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('getJobsByCustomer', () => {
    it('should retrieve jobs filtered by customer ID', () => {
      const customerId = 1;
      const mockJobs = [
        { id: 1, job_number: 'JOB-001', customer: customerId }
      ];

      service.getJobsByCustomer(customerId).subscribe(jobs => {
        expect(jobs).toEqual(mockJobs);
      });

      const req = httpMock.expectOne(`${apiUrl}?customer_id=${customerId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockJobs);
    });
  });
});

