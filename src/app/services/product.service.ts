import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {

  // ── Relative URL — Angular proxy forwards to http://localhost:3000 ──
  private apiUrl = '';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/products');
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`/products/${id}`);
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`/products?category=${category}`);
  }
}
