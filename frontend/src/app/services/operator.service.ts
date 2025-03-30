import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OperatorService {
  private apiUrl = environment.apiBaseUrl + 'operators/';

  constructor(private http: HttpClient) {}

  // GET all operators (ITO and MTO)
  getOperators(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // POST a new operator
  createOperator(data: {
    name: string;
    operator_type: 'ITO' | 'MTO';
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // (Optional) GET a single operator
  getOperatorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }
}
