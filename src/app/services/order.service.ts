import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private apiUrl = '';

  constructor(private http: HttpClient) {}

  getOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`/orders?userId=${userId}`);
  }

  placeOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>('/orders', order);
  }
}
