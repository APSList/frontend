import {computed, inject, Injectable, signal} from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import {toSignal} from "@angular/core/rxjs-interop";
import {ProfileRestService} from "./profile-rest.service";

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _currentUser = new BehaviorSubject<User | null>(null);
  private profileRest = inject(ProfileRestService);

  // Expose the user as an observable for components to subscribe to
  currentUser$ = this._currentUser.asObservable();

  initialized = signal<boolean>(false);

  private _currentSession: Session | null = null;

  // ... inside SupabaseService class
  user = toSignal(this.currentUser$); // Convert observable to Signal

// Reactively calculate the role
  role = computed(() => this.user()?.user_metadata['role'] || 'GUEST');

// Reactively calculate the Org ID
  orgId = computed(() => this.user()?.user_metadata['organization_id']);

// Helper to check if user is an owner
  isOwner = computed(() => this.role() === 'OWNER');

  orgName = signal<string>('Loading...');

  private fetchOrganizationName() {
    this.profileRest.getOrganizationName().subscribe({
      next: (res) => this.orgName.set(res.name),
      error: () => this.orgName.set('HostFlow Entity') // Fallback name
    });
  }


  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Initial session check
    this.supabase.auth.getSession().then(({ data }) => {
      this._currentUser.next(data.session?.user ?? null);
      this._currentSession = data.session;
      this.initialized.set(true);
    });

    // Listen to auth state changes (login, logout, token refresh)
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._currentUser.next(session?.user ?? null);
      this._currentSession = session;
      this.initialized.set(true);

      if (session) {
        this.fetchOrganizationName();
      } else {
        this.orgName.set('');
      }
    });
  }

  async signUpNewUser(email: string, password: string, fullName: string, orgId: number) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_id: orgId,
          role: 'MEMBER' // Hardcoded as MEMBER for new invites
        }
      }
    });
  }

  async signIn(email: string) {
    // Magic Link example
    return await this.supabase.auth.signInWithOtp({ email });
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  get accessToken(): string | undefined {
    return this._currentSession?.access_token;
  }

  // Or better, a method that returns the current token string directly
  getToken(): string | null {
    // Access the session directly from the supabase-js instance
    // Note: in newer versions of supabase-js, it's async: await supabase.auth.getSession()
    // but for the interceptor, we usually want the current cached sync value.
    const authJson = localStorage.getItem(`sb-${environment.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`);
    if (authJson) {
      const session = JSON.parse(authJson);
      return session?.access_token;
    }
    return null;
  }

  async signInWithPassword(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }
}
