import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import {CardModule} from "primeng/card";
import {ButtonModule} from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import {PasswordModule} from "primeng/password";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      // We will add this 'signInWithPassword' method to your service in a moment
      const { error } = await this.supabase.signInWithPassword(email, password);

      if (error) throw error;

      // Success! Redirect to dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      alert(error.message || 'An error occurred during login');
    } finally {
      this.loading = false;
    }
  }
}
