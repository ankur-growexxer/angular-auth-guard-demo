import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/products';

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getAll(): Observable<any> {
    return this.http.get(this.baseUrl, this.getHeaders());
  }

  create(product: any): Observable<any> {
    return this.http.post(this.baseUrl, product, this.getHeaders());
  }

  update(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, product, this.getHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
