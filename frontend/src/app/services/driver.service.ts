import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = environment.apiBaseUrl + 'drivers/';

  constructor(private http: HttpClient) {}

  createDriver(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllDrivers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
