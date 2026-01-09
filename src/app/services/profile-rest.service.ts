import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {ProfileUser} from "../types/profile.types";
import {map} from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class ProfileRestService {
  private http = inject(HttpClient);
  // Ensure profileBaseUrl is defined in your environment.ts (e.g., http://localhost:8080/api)
  private userUrl = `${environment.profileBaseUrl}/users`;
  private baseUrl = `${environment.profileBaseUrl}`;

  /** * GET /users -> list all users in the organization
   * (The Go middleware handles the organization_id filtering)
   */
  getAllUsers(): Observable<ProfileUser[]> {
    return this.http.get<any[]>(this.userUrl).pipe(
      map(users => users.map(user => this.mapToProfileUser(user)))
    );
  }

  /** GET /users/:id -> get a single user by ID */
  getUserById(id: string): Observable<ProfileUser> {
    return this.http.get<any>(`${this.userUrl}/${id}`).pipe(
      map(user => this.mapToProfileUser(user))
    );
  }

  /** PUT /users/:id/status -> update a user's status' */
  updateUserStatus(userId: string, status: string): Observable<void> {
    return this.http.put<void>(`${this.userUrl}/${userId}/status`, { status });
  }

  getOrganizationName(): Observable<{ name: string }> {
    // No ID needed in the URL anymore!
    return this.http.get<{ name: string }>(`${this.baseUrl}/organization/name`);
  }

  /** Helper to map backend snake_case OIDs/names to frontend camelCase */
  private mapToProfileUser(data: any): ProfileUser {
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      role: data.role,
      email: data.email,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
