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
    // accepts either email or username, so just require a non-empty string
    identifier: ['', [Validators.required, Validators.minLength(3)]]
  });

  loading = false;
  msg = '';  // success message (non-enumerating)
  err = '';  // only used for unexpected errors

  submit() {
    if (this.form.invalid || this.loading) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.msg = ''; this.err = '';

    const { identifier } = this.form.getRawValue();

    this.auth.requestPasswordReset(identifier!).subscribe({
      next: () => {
        this.loading = false;
        // Do not reveal if the account exists
        this.msg = 'If an account exists for that email/username, instructions have been sent.';
      },
      error: (e) => {
        this.loading = false;
        // Same message to avoid user enumeration
        this.msg = 'If an account exists for that email/username, instructions have been sent.';
        console.error('Password recovery request failed:', e);
      }
    });
  }

  back() { this.router.navigateByUrl('/auth/login'); }
}
