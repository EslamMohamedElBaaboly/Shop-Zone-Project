import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl:    './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {

  currentUser: User | null = null;
  userId:      string | null = null;
  cartCount    = 0;

  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // ── Reactive: يتحدث لو اتغيرت بيانات الـ user ─────────────────
    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.userId      = localStorage.getItem('userId');
      })
    );

    // ── Cart count for the stats section ──────────────────────────
    this.subs.add(
      this.cartService.cartCount$.subscribe(count => {
        this.cartCount = count;
      })
    );
  }

  // ── Initial letter for the avatar ──────────────────────────────
  get avatarLetter(): string {
    return this.currentUser?.name?.charAt(0)?.toUpperCase() ?? '?';
  }

  // ── Truncated user id display ───────────────────────────────────
  get userIdDisplay(): string {
    return this.userId ? `#${this.userId}` : '—';
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
