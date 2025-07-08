import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/services/auth.service';
import { SafehelperService } from '../../services/services/safehelper.service';
@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  showPassword = false;
  resetEmail = '';
  isLoading = false;        // For login
  isResetLoading = false;   // For forgot password

  constructor(private fb:FormBuilder,  private safeHelper: SafehelperService,private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.auth.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.safeHelper.setItem('token', res.token)
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err?.error?.message || 'Invalid credentials',
          confirmButtonColor: '#0B3D91'
        });
      }
    });
  }

  showForgotPassword() {
    Swal.fire({
      title: 'Forgot Password?',
      input: 'email',
      inputLabel: 'Enter your email',
      confirmButtonText: 'Send Reset Link',
      confirmButtonColor: '#0B3D91',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.isResetLoading = true; // show full-page loader

        this.auth.requestPasswordReset(result.value).subscribe({
          next: () => {
            this.isResetLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Email Sent',
              text: 'Check your email for reset instructions.',
              confirmButtonColor: '#0B3D91'
            });
          },
          error: () => {
            this.isResetLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Enter a valid email',
              confirmButtonColor: '#0B3D91'
            });
          }
        });
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

