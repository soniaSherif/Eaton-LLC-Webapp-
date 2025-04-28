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
    return this.http.get<any[]>(this.apiUrl);
  }

  getJobsByDate(selectedDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?date=${selectedDate}`);
  }
  // job.service.ts

  getJobByNumber(jobNumber: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}jobs/${jobNumber}/`);
  }
  getJobById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}jobs/${id}/`);
  }  
  // job.service.ts
  updateJob(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}jobs/${id}/`, data);
  }

}
