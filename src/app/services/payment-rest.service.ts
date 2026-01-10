// payment-rest.service.ts (camelCase everywhere)

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import type { Payment, PaymentListQuery, PaymentUpsertRequestDTO } from '../types/payment.types';

@Injectable({ providedIn: 'root' })
export class PaymentRestService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.paymentBaseUrl}/payments`;

  get(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${id}`);
  }

  list(query?: PaymentListQuery): Observable<Payment[]> {

    return this.http.get<Payment[]>(this.baseUrl);
  }

  create(dto: PaymentUpsertRequestDTO): Observable<number> {
    return this.http.post<number>(this.baseUrl, dto);
  }

 update(id: number, dto: PaymentUpsertRequestDTO): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
