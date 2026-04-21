import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProductListComponent implements OnInit {

  allProducts:      Product[] = [];
  filteredProducts: Product[] = [];
  categories:       string[]  = [];

  searchTerm       = '';
  selectedCategory = 'All';
  sortBy: SortOption = 'default';
  loading          = true;
  errorMsg         = '';

  addingProductId: number | null = null;
  addedProductId:  number | null = null;

  constructor(
    private productService: ProductService,
    private cartService:    CartService,
    private authService:    AuthService,
    private router:         Router,
    private cdr:            ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts      = products;
        this.filteredProducts = products;
        const uniqueCats = [...new Set(products.map(p => p.category))].sort();
        this.categories  = ['All', ...uniqueCats];
        this.loading     = false;
        this.errorMsg    = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = 'Could not load products. Make sure JSON Server is running on port 3000 (npm run server).';
        console.error('Product load error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let result = this.allProducts.filter(p => {
      const matchSearch   = p.name.toLowerCase()
                              .includes(this.searchTerm.toLowerCase().trim());
      const matchCategory = this.selectedCategory === 'All'
                              || p.category === this.selectedCategory;
      return matchSearch && matchCategory;
    });

    switch (this.sortBy) {
      case 'price-asc':  result = [...result].sort((a, b) => a.price  - b.price);  break;
      case 'price-desc': result = [...result].sort((a, b) => b.price  - a.price);  break;
      case 'rating':     result = [...result].sort((a, b) => b.rating - a.rating); break;
    }

    this.filteredProducts = result;
    this.cdr.detectChanges();
  }

  onSearchChange():   void { this.applyFilters(); }
  onCategoryChange(): void { this.applyFilters(); }
  onSortChange():     void { this.applyFilters(); }

  clearFilters(): void {
    this.searchTerm       = '';
    this.selectedCategory = 'All';
    this.sortBy           = 'default';
    this.filteredProducts = [...this.allProducts];
    this.cdr.detectChanges();
  }

  get isFiltered(): boolean {
    return this.searchTerm !== '' ||
           this.selectedCategory !== 'All' ||
           this.sortBy !== 'default';
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

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    const userId = this.authService.getUserId()!;
    this.addingProductId = product.id;
    this.cdr.detectChanges();

    this.cartService.addToCart({
      userId,
      productId: product.id,
      name:      product.name,
      price:     product.price,
      quantity:  1
    }).subscribe({
      next: () => {
        this.addingProductId = null;
        this.addedProductId  = product.id;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.addedProductId = null;
          this.cdr.detectChanges();
        }, 2500);
      },
      error: () => {
        this.addingProductId = null;
        this.cdr.detectChanges();
      }
    });
  }

  retry(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  isAdding(id: number): boolean { return this.addingProductId === id; }
  isAdded(id: number):  boolean { return this.addedProductId  === id; }
}
