import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl:    './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {

  currentUser: User | null = null;
  cartCount               = 0;
  isMobileMenuOpen        = false;

  private subs = new Subscription(); 

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get firstName(): string {
    return this.currentUser?.name?.split(' ')?.[0] ?? '';
  }

  ngOnInit(): void {

    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;

        if (user) {
          const userId = this.authService.getUserId();
          if (userId) {
            this.cartService.getCartItems(userId).subscribe();
          }
        } else {
          this.cartCount = 0;
        }
      })
    );

    this.subs.add(
      this.cartService.cartCount$.subscribe(count => {
        this.cartCount = count;
      })
    );
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout(); 
    this.closeMobileMenu();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe(); 
  }
}
