import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {

  product:  Product | null = null;
  loading   = true;
  adding    = false;
  added     = false;
  quantity  = 1;
  qtyError  = '';

  constructor(
    private route:          ActivatedRoute,
    private productService: ProductService,
    private cartService:    CartService,
    private authService:    AuthService,
    private cdr:            ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product  = product;
        this.loading  = false;
        this.quantity = product.stock > 0 ? 1 : 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Product detail error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  get stockLevel(): 'out' | 'low' | 'ok' {
    if (!this.product || this.product.stock === 0) return 'out';
    if (this.product.stock <= 5) return 'low';
    return 'ok';
  }

  get canAdd(): boolean {
    return !this.adding &&
           !!this.product &&
           this.product.stock > 0 &&
           this.quantity >= 1 &&
           this.quantity <= this.product.stock &&
           !this.qtyError;
  }

  getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i)           stars.push('full');
      else if (rating >= i - .5) stars.push('half');
      else                       stars.push('empty');
    }
    return stars;
  }

  increment(): void {
    if (!this.product || this.quantity >= this.product.stock) return;
    this.quantity++;
    this.validateQty();
  }

  decrement(): void {
    if (this.quantity <= 1) return;
    this.quantity--;
    this.validateQty();
  }

  onQtyInput(): void {
    this.validateQty();
  }

  validateQty(): void {
    if (!this.product) return;
    if (this.quantity < 1) {
      this.qtyError = 'Minimum quantity is 1';
    } else if (this.quantity > this.product.stock) {
      this.qtyError = `Maximum available: ${this.product.stock}`;
    } else {
      this.qtyError = '';
    }
    this.cdr.detectChanges();
  }

  addToCart(): void {
    if (!this.canAdd || !this.product) return;

    if (!this.authService.isLoggedIn()) return;

    const userId = this.authService.getUserId()!;
    this.adding  = true;
    this.cdr.detectChanges();

    this.cartService.addToCart({
      userId,
      productId: this.product.id,
      name:      this.product.name,
      price:     this.product.price,
      quantity:  this.quantity
    }).subscribe({
      next: () => {
        this.adding = false;
        this.added  = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.added = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.adding = false;
        this.cdr.detectChanges();
      }
    });
  }
}
