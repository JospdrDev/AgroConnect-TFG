import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Finca } from '../models/finca';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FincaService {

  constructor(private http: HttpClient) {}

  getFincas(): Observable<Finca[]> {
    return this.http.get<Finca[]>(`${environment.apiUrl}/api/fincas`);
  }

  getFinca(id: number): Observable<Finca> {
    return this.http.get<Finca>(`${environment.apiUrl}/api/fincas/${id}`);
  }

  createFinca(finca: Partial<Finca>): Observable<Finca> {
    return this.http.post<Finca>(`${environment.apiUrl}/api/fincas`, finca);
  }

  updateFinca(id: number, finca: Partial<Finca>): Observable<Finca> {
    return this.http.put<Finca>(`${environment.apiUrl}/api/fincas/${id}`, finca);
  }

  deleteFinca(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/fincas/${id}`);
  }
}