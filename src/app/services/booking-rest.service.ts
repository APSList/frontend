// booking-rest.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import type {
  Reservation,
  ReservationRequest,
} from '../types/booking.types';
import {map} from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class BookingRestService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.bookingBaseUrl}/reservations`;
  private customerUrl = `${environment.bookingBaseUrl}/customer`;

  /** GET /reservations -> all reservations */
  getAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.baseUrl);
  }

  /** GET /reservations/{id} -> reservation by id */
  /** GET /reservations/{id} -> reservation by id */
  getById(id: number): Observable<Reservation> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(res => ({
        id: res.id,
        organizationId: res.organization_id,
        propertyId: res.property_id,
        customerId: res.customer_id,
        startDate: res.check_in_date,
        endDate: res.check_out_date,
        status: res.status,
        totalPrice: res.total_price,
        noOfGuests: res.no_of_guests,
        priceElements: res.price_elements,
        guestData: res.guest_data,
        additionalRequests: res.additional_requests,
        createdAt: res.created_at,
        updatedAt: res.updated_at,
        propertyName: '', // will fetch later if needed
        customerName: '', // will fetch later if needed
        paymentUrl: res.payment_url
      }))
    );
  }

  /** POST /reservations -> create a new reservation */
  create(dto: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, dto);
  }

  /** PUT /reservations/{id} -> update reservation */
  update(id: number, dto: ReservationRequest): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.baseUrl}/${id}`, dto);
  }

  /** DELETE /reservations/{id} -> delete reservation */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** POST /reservations/{id}/cancel -> cancel a reservation */
  cancel(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.baseUrl}/${id}/cancel`, {});
  }

  /** POST /reservations/{id}/checkin -> check in a reservation */
  checkIn(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.baseUrl}/${id}/checkin`, {});
  }

  /** POST /reservations/{id}/checkout -> check out a reservation */
  checkOut(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.baseUrl}/${id}/checkout`, {});
  }

  /** POST /reservations/{id}/confirm -> confirm a reservation */
  confirm(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.baseUrl}/${id}/confirm`, {});
  }

/*  /!** PATCH /reservations/{id}/status -> update reservation status *!/
  updateStatus(id: number, dto: StatusUpdateRequest): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.baseUrl}/${id}/status`, dto);
  }*/

  /** GET /customer -> list all customers */
  getAllCustomers(): Observable<any[]> {
    return this.http.get<any[]>(this.customerUrl);
  }

  /** GET /customer/{id} -> get a single customer */
  getCustomerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.customerUrl}/${id}`);
  }

  /** POST /customer -> create a new customer */
  createCustomer(dto: { fullName: string; email: string }): Observable<any> {
    return this.http.post<any>(this.customerUrl, dto);
  }

  /** PUT /customer/{id} -> update a customer */
  updateCustomer(
    id: number,
    dto: { fullName?: string; email?: string }
  ): Observable<any> {
    return this.http.put<any>(`${this.customerUrl}/${id}`, dto);
  }

  /** DELETE /customer/{id} -> delete a customer */
  deleteCustomer(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.customerUrl}/${id}`);
  }
}
