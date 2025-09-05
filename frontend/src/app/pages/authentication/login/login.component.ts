import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = false;
  error = '';

  submit() {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/daily-board');
      },
      error: (e) => {
        this.loading = false;
        this.error = 'Invalid username or password';
        console.error(e);
      }
    });
  }
}
