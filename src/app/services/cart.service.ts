import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {

  // ── Relative URL — Angular proxy forwards to http://localhost:3000 ──
  private apiUrl = '';

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCartItems(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`/cart?userId=${userId}`).pipe(
      tap(items => this.cartCountSubject.next(items.length))
    );
  }

  addToCart(item: Omit<CartItem, 'id'>): Observable<CartItem> {
    return this.http.post<CartItem>('/cart', item).pipe(
      tap(() => {
        const current = this.cartCountSubject.getValue();
        this.cartCountSubject.next(current + 1);
      })
    );
  }

  updateQuantity(id: number, quantity: number): Observable<CartItem> {
    return this.http.patch<CartItem>(`/cart/${id}`, { quantity });
  }

  removeFromCart(id: number): Observable<void> {
    return this.http.delete<void>(`/cart/${id}`).pipe(
      tap(() => {
        const current = this.cartCountSubject.getValue();
        this.cartCountSubject.next(Math.max(0, current - 1));
      })
    );
  }

  clearCart(userId: number): Observable<CartItem[]> {
    return new Observable(observer => {
      this.getCartItems(userId).subscribe({
        next: (items) => {
          if (items.length === 0) {
            this.cartCountSubject.next(0);
            observer.next([]);
            observer.complete();
            return;
          }
          let completed = 0;
          items.forEach(item => {
            this.http.delete<void>(`/cart/${item.id}`).subscribe({
              next: () => {
                completed++;
                if (completed === items.length) {
                  this.cartCountSubject.next(0);
                  observer.next([]);
                  observer.complete();
                }
              },
              error: err => observer.error(err)
            });
          });
        },
        error: err => observer.error(err)
      });
    });
  }

  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }
}
