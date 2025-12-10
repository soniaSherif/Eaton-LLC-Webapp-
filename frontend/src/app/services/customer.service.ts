import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = environment.apiBaseUrl + 'customers/'; // Your Django endpoint

  constructor(private http: HttpClient) {}

  createCustomer(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
}
