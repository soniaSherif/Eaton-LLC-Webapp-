import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignTruckService {
  private apiUrl = environment.apiBaseUrl + 'assign-truck/';

  constructor(private http: HttpClient) {}

  assignTruckToDriver(driverId: number, truckId: number): Observable<any> {
    return this.http.post(this.apiUrl, { driver_id: driverId, truck_id: truckId });
  }
}
