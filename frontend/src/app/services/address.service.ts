import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = environment.apiBaseUrl + 'addresses/';  // Make sure Django has this endpoint!

  constructor(private http: HttpClient) {}

  createAddress(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllAddresses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
