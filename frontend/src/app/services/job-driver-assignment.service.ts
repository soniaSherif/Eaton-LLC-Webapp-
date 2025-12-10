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

@Injectable({ providedIn: 'root' })
export class JobDriverAssignmentService {
  private url = `${environment.apiBaseUrl}job-driver-assignments/`;

  constructor(private http: HttpClient) {}

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
}
