import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
   public router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please complete all fields correctly.',
        confirmButtonColor: '#13233f'
      });
      return;
    }

    this.isLoading = true;

    this.auth.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You can now log in.',
          confirmButtonColor: '#13233f'
        }).then(() => this.router.navigate(['/login']));
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: err?.error?.message || 'Something went wrong.',
          confirmButtonColor: '#13233f'
        });
      }
    });
  }
}

