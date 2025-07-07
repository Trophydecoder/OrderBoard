import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  user: any = {};              // Stores user profile data
  originalUser: any = {};      // Backup for canceling edits
  changePasswordForm: FormGroup;
  isEditing: boolean = false;  // Tracks edit mode
  isLoading = false;           // Tracks loading state (for both Save & Reset password)

  constructor(
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.changePasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.auth.getProfile().subscribe({
      next: (res: any) => {
        this.user = { ...res };
        this.originalUser = { ...res }; // Backup for cancel
      },
      error: () => {
        Swal.fire('Error', 'Failed to load profile', 'error');
      }
    });
  }

  enableEditing() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.user = { ...this.originalUser }; // Restore original
    this.isEditing = false;
  }

  saveProfile() {
    Swal.fire({
      title: 'Confirm Changes',
      text: 'Are you sure you want to update your profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B3D91',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save changes!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; // Show loader
        this.auth.updateProfile({
          username: this.user.username,
          email: this.user.email
        }).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            // Replace token with refreshed one
            if (res.token) {
              localStorage.setItem('token', res.token);
            }
            Swal.fire('Success', 'Profile updated!', 'success');
            this.originalUser = { ...this.user };
            this.isEditing = false; // Exit edit mode
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('Error', err.error.message || 'Failed to update profile.', 'error');
          }
        });
      }
    });
  }

  requestPasswordReset() {
    this.isLoading = true; // start loader
    if (this.changePasswordForm.invalid) return;

    const email = this.changePasswordForm.value.email;

   
    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.isLoading = false; // stop loader
        Swal.fire('Success', 'Password reset link sent!', 'success');
        this.changePasswordForm.reset();
      },
      error: (err) => {
        this.isLoading = false; // Stop loader on error
        Swal.fire('Error', err?.error?.message || 'Failed to send reset link.', 'error');
      }
    });
  }

  changePlan() {
    Swal.fire('Coming Soon', 'Plan management will be available soon.', 'info');
  }
}
