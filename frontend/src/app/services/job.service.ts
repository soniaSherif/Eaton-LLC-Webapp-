import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = environment.apiBaseUrl + 'jobs/';

  constructor(private http: HttpClient) {}

  createJob(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?_ts=${Date.now()}`);
  }

  getJobsByDate(selectedDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?date=${selectedDate}&_ts=${Date.now()}`);
  }
  // job.service.ts

  getJobByNumber(jobNumber: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}jobs/${jobNumber}/?_ts=${Date.now()}`);
  }
  getJobById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}jobs/${id}/?_ts=${Date.now()}`);
  }  
  // job.service.ts
  updateJob(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}jobs/${id}/`, data);
  }

  // Get jobs filtered by customer (through invoices)
  getJobsByCustomer(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?customer_id=${customerId}`);
  }

}
