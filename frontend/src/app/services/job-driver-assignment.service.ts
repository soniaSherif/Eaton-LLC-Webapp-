// src/app/services/job-driver-assignment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export interface DispatchPayload {
  job: number;              // job ID
  driver_truck: number;     // DriverTruckAssignment ID
  assigned_at?: string;     // optional ISO timestamp
}

export interface JobDriverAssignment {
  id?: number;
  job: number;
  driver_truck: number;
  assigned_at?: string;
  unassigned_at?: string | null;
  // Nested info for display
  job_info?: {
    id: number;
    job_number: string;
    project: string;
    job_date: string;
  };
  driver_truck_info?: {
    id: number;
    driver: string;
    truck_type: string;
    driver_phone: string;
  };
}

@Injectable({ providedIn: 'root' })
export class JobDriverAssignmentService {
  private url = `${environment.apiBaseUrl}job-driver-assignments/`;

  constructor(private http: HttpClient) {}

  /** Fetch all job-driver assignments */
  getAllAssignments(): Observable<JobDriverAssignment[]> {
    return this.http.get<JobDriverAssignment[]>(this.url);
  }

  /** Get a single assignment by ID */
  getAssignmentById(id: number): Observable<JobDriverAssignment> {
    return this.http.get<JobDriverAssignment>(`${this.url}${id}/`);
  }

  /** Fetch only *active* driver→truck assignments */
  listActiveDriverTrucks(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}driver-truck-assignments/?unassigned_at__isnull=true`
    );
  }

  /** Create a new job→driver_truck assignment */
  dispatchToJob(payload: DispatchPayload): Observable<any> {
    return this.http.post(this.url, payload);
  }

  /** Update an existing assignment */
  updateAssignment(id: number, data: Partial<JobDriverAssignment>): Observable<JobDriverAssignment> {
    return this.http.patch<JobDriverAssignment>(`${this.url}${id}/`, data);
  }

  /** Delete an assignment */
  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}
