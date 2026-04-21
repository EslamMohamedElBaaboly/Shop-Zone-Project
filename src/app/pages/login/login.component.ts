import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss'
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  errorMsg       = '';
  successMsg     = '';   // يظهر لو قادم من صفحة Register
  loading        = false;
  showPassword   = false;
  returnUrl      = '/products';

  constructor(
    private fb:          FormBuilder,
    private authService: AuthService,
    private router:      Router,
    private route:       ActivatedRoute
  ) {}

  ngOnInit(): void {
    // ── لو المستخدم logged in أصلاً — ابعته لـ products ────────────
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/products']);
      return;
    }

    // ── لو قادم من صفحة Register — عرّض رسالة نجاح ─────────────────
    const registered = this.route.snapshot.queryParamMap.get('registered');
    if (registered === 'true') {
      this.successMsg = '🎉 Account created successfully! Please sign in.';
    }

    // ── returnUrl — يرجع للصفحة اللي كان رايحلها قبل الـ guard ──────
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/products';

    // ── بناء الـ Form ────────────────────────────────────────────────
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // ── Getters — بيسهّلوا الوصول في الـ template ────────────────────
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading  = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (users) => {
        this.loading = false;

        if (users && users.length > 0) {
          // ✅ Interceptor already:
          //    1. saved userId + currentUser to localStorage
          //    2. called authService.notifyLoginSuccess(user)
          //    3. Navbar reacted and loaded cart count
          // → فقط navigate
          this.router.navigate([this.returnUrl]);
        } else {
          // مصفوفة فاضية = credentials غلط
          this.errorMsg = 'Invalid email or password.';
        }
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Unable to connect. Is the server running?';
      }
    });
  }
}
