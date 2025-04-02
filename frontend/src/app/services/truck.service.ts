import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  private apiUrl = environment.apiBaseUrl + 'trucks/';

  constructor(private http: HttpClient) {}

  createTruck(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllTrucks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getUnassignedTrucks(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}unassigned-trucks/`);
  }
  

  
}
