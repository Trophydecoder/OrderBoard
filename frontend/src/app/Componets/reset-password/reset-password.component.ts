import { Component , OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get token from URL
    this.token = this.route.snapshot.paramMap.get('token') || '';
    console.log(' TOKEN FROM URL:',this.token); // DEBUG

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    const { password, confirmPassword } = this.resetForm.value;

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords Do Not Match',
        text: 'Please make sure both password fields match.',
        confirmButtonColor: '#0B3D91'
      });
      return;
    }

    console.log('Submitting password reset with token:', this.token); // DEBUG

    this.isLoading = true;

    this.auth.resetPassword(password, this.token).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful',
          text: 'You can now log in with your new password.',
          confirmButtonColor: '#0B3D91'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Reset Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: err?.error?.message || 'Something went wrong.',
          confirmButtonColor: '#0B3D91'
        });
      }
    });
  }
}
