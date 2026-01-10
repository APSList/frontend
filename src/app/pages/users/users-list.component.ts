import { Component, OnInit, signal } from '@angular/core';
import { ProfileRestService } from '../../services/profile-rest.service';
import { ProfileUser } from '../../types/profile.types';
import {CommonModule} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SupabaseService} from "../../services/supabase.service";

@Component({
  selector: 'app-users',
  templateUrl: './users-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule
  ],
})
export class UsersList implements OnInit {
  // Signals for state management
  rows = signal<ProfileUser[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  displayModal = signal<boolean>(false);
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private profileService: ProfileRestService, private supabaseService: SupabaseService) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.profileService.getAllUsers().subscribe({
      next: (users) => {
        this.rows.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Could not load users. Ensure you have proper permissions.');
        this.loading.set(false);
      }
    });
  }

  addNew() {
    this.userForm.reset();
    this.displayModal.set(true);
  }

// users-list.component.ts

  async saveUser() {
    if (this.userForm.valid) {
      this.loading.set(true);
      const { fullName, email, password } = this.userForm.value;

      // Get the organization_id from the currently logged-in user
      const currentOrgId = this.supabaseService.user()?.user_metadata['organization_id'];

      try {
        const { data, error } = await this.supabaseService.signUpNewUser(
          email,
          password,
          fullName,
          currentOrgId
        );

        if (error) {
          this.error.set(error.message);
        } else {
          console.log('User invited successfully:', data);
          this.displayModal.set(false);
          this.userForm.reset();
          // Refresh the list to show the new (likely pending) user
          this.loadUsers();
        }
      } catch (err) {
        this.error.set('An unexpected error occurred.');
      } finally {
        this.loading.set(false);
      }
    }
  }

  deactivateUser(user: ProfileUser) {
    if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      this.loading.set(true);

      this.profileService.updateUserStatus(user.id, 'INACTIVE').subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.error.set('Failed to deactivate user.');
          this.loading.set(false);
        }
      });
    }
  }

  openDetails(user: ProfileUser) {
    console.log('Details for:', user.name);
  }
}
