import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-forgot-password-request',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password-request.component.html',
  styleUrls: ['./forgot-password-request.component.scss']
})
export class ForgotPasswordRequestComponent {
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.minLength(8)]]
  });

  loading = false;
  msg = '';  // user-facing messages
  err = '';  // unexpected errors
  stage: 'request' | 'reset' = 'request';

  submit() {
    if (this.loading) return;
    this.err = '';

    if (this.stage === 'request') {
      if (this.form.controls.email.invalid) { this.form.controls.email.markAsTouched(); return; }
      this.requestCode();
    } else {
      if (this.form.controls.code.invalid || this.form.controls.newPassword.invalid) {
        this.form.controls.code.markAsTouched();
        this.form.controls.newPassword.markAsTouched();
        return;
      }
      this.resetPassword();
    }
  }

  private requestCode() {
    this.loading = true;
    this.msg = '';
    const { email } = this.form.getRawValue();

    this.auth.requestPasswordReset(email!).subscribe({
      next: () => {
        this.loading = false;
        // Do not reveal if the account exists
        this.msg = 'If an account exists for that email, a code has been sent.';
        this.stage = 'reset';
      },
      error: (e) => {
        this.loading = false;
        // Same message to avoid user enumeration
        this.msg = 'If an account exists for that email, a code has been sent.';
        console.error('Password recovery request failed:', e);
      }
    });
  }

  private resetPassword() {
    this.loading = true;
    this.msg = '';
    const { email, code, newPassword } = this.form.getRawValue();
    // Backend verify then confirm; we can go straight to confirm (verify happens there)
    this.auth.resetPassword(email!, code!, newPassword!).subscribe({
      next: () => {
        this.loading = false;
        this.msg = 'Password updated. You can now sign in.';
        setTimeout(() => this.router.navigateByUrl('/auth/login'), 800);
      },
      error: (e) => {
        this.loading = false;
        this.err = 'Invalid code or unable to reset. Please try again.';
        console.error('Password reset failed:', e);
      }
    });
  }

  back() { this.router.navigateByUrl('/auth/login'); }
}
