import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {

  orders:          Order[] = [];
  loading          = true;
  errorMsg         = '';
  expandedOrderId: number | null = null;

  readonly statusConfig: Record<string, { icon: string; label: string; cls: string }> = {
    pending:    { icon: 'bi-clock-history',  label: 'Pending',    cls: 'status--pending'    },
    processing: { icon: 'bi-arrow-repeat',   label: 'Processing', cls: 'status--processing' },
    delivered:  { icon: 'bi-bag-check-fill', label: 'Delivered',  cls: 'status--delivered'  },
    cancelled:  { icon: 'bi-x-circle-fill',  label: 'Cancelled',  cls: 'status--cancelled'  }
  };

  constructor(
    private orderService: OrderService,
    private authService:  AuthService,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.orderService.getOrders(userId).subscribe({
      next: (orders) => {
        this.orders  = orders.sort((a, b) => b.id - a.id);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = 'Could not load orders. Is JSON Server running?';
        console.error('Orders load error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(orderId: number): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    this.cdr.detectChanges();
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrderId === orderId;
  }

  getStatus(status: string) {
    return this.statusConfig[status] ?? {
      icon: 'bi-question-circle',
      label: status,
      cls: 'status--pending'
    };
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}
