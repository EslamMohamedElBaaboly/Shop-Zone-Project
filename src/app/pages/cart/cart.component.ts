import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {

  cartItems:   CartItem[] = [];
  loading      = true;
  orderPlaced  = false;
  placingOrder = false;
  removingId:  number | null = null;
  errorMsg     = '';

  private qtyChange$ = new Subject<{ id: number; qty: number }>();

  constructor(
    private cartService:  CartService,
    private orderService: OrderService,
    private authService:  AuthService,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.cartService.getCartItems(userId).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading   = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = 'Could not load cart. Is JSON Server running?';
        console.error('Cart load error:', err);
        this.cdr.detectChanges();
      }
    });

    this.qtyChange$
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => a.id === b.id && a.qty === b.qty)
      )
      .subscribe(({ id, qty }) => {
        this.cartService.updateQuantity(id, qty).subscribe();
      });
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get itemCount(): number {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  increment(item: CartItem): void {
    item.quantity++;
    this.qtyChange$.next({ id: item.id, qty: item.quantity });
    this.cdr.detectChanges();
  }

  decrement(item: CartItem): void {
    if (item.quantity <= 1) return;
    item.quantity--;
    this.qtyChange$.next({ id: item.id, qty: item.quantity });
    this.cdr.detectChanges();
  }

  onQtyInput(item: CartItem): void {
    if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
      item.quantity = 1;
    }
    this.qtyChange$.next({ id: item.id, qty: item.quantity });
  }

  removeItem(item: CartItem): void {
    this.removingId = item.id;
    this.cdr.detectChanges();
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.cartItems  = this.cartItems.filter(i => i.id !== item.id);
        this.removingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.removingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) return;
    this.placingOrder = true;
    this.cdr.detectChanges();

    const userId = this.authService.getUserId()!;
    const order = {
      userId,
      total:  this.subtotal,
      status: 'pending' as const,
      date:   new Date().toISOString().split('T')[0],
      items:  this.cartItems.map(i => ({
        productId: i.productId,
        name:      i.name,
        quantity:  i.quantity,
        price:     i.price
      }))
    };

    this.orderService.placeOrder(order).subscribe({
      next: () => {
        this.cartService.clearCart(userId).subscribe(() => {
          this.cartItems    = [];
          this.orderPlaced  = true;
          this.placingOrder = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.placingOrder = false;
        this.cdr.detectChanges();
      }
    });
  }
}
