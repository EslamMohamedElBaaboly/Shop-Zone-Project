import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function mustMatch(group: AbstractControl): ValidationErrors | null {
  const pw      = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!confirm) return null;
  return pw === confirm ? null : { mustMatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl:    './register.component.scss'
})
export class RegisterComponent implements OnInit {

  form!: FormGroup;
  loading             = false;
  errorMsg            = '';
  showPassword        = false;
  showConfirmPassword = false;

  constructor(
    private fb:          FormBuilder,
    private authService: AuthService,
    private router:      Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/products']);
      return;
    }

    this.form = this.fb.group(
      {
        name:            ['', [Validators.required, Validators.minLength(3)]],
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: mustMatch }   // ← FormGroup-level validator
    );
  }

  // ── Getters ───────────────────────────────────────────────────────
  get name()            { return this.form.get('name')!; }
  get email()           { return this.form.get('email')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  get passwordsMismatch(): boolean {
    return !!this.form.errors?.['mustMatch'] &&
           (this.confirmPassword.dirty || this.confirmPassword.touched);
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' | null {
    const val = this.password.value as string;
    if (!val) return null;
    const hasUpper   = /[A-Z]/.test(val);
    const hasNumber  = /[0-9]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);
    const score      = [val.length >= 10, hasUpper, hasNumber, hasSpecial]
                         .filter(Boolean).length;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'medium';
    return 'strong';
  }

  togglePassword():        void { this.showPassword        = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading  = true;
    this.errorMsg = '';

    const { name, email, password } = this.form.value;

    this.authService.register({ name, email, password, role: 'user' }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Registration failed. Email may already be in use.';
      }
    });
  }
}
