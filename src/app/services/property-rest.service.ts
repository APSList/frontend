// property-rest.service.ts (camelCase everywhere)

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import type { Property, PropertyUpsertRequestDTO } from '../types/property.types';

@Injectable({ providedIn: 'root' })
export class PropertyRestService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/property`;

  /** GET /property/{id} -> returns Property */
  get(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.baseUrl}/${id}`);
  }

  /** POST /property (multipart/form-data) -> returns propertyId */
  create(dto: PropertyUpsertRequestDTO): Observable<number> {
    const form = this.toFormData(dto);
    return this.http.post<number>(this.baseUrl, form);
  }

  /** PUT /property/{id} (multipart/form-data) -> returns updatedId */
  update(id: number, dto: PropertyUpsertRequestDTO): Observable<number> {
    const form = this.toFormData(dto);
    return this.http.put<number>(`${this.baseUrl}/${id}`, form);
  }

  /** DELETE /property/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private toFormData(dto: PropertyUpsertRequestDTO): FormData {
    const form = new FormData();

    form.append('name', dto.name);

    if (dto.description != null) form.append('description', dto.description);
    if (dto.address != null) form.append('address', dto.address);
    if (dto.country != null) form.append('country', dto.country);

    form.append('propertyType', String(dto.propertyType));

    if (dto.maxGuests != null) form.append('maxGuests', String(dto.maxGuests));
    if (dto.bedrooms != null) form.append('bedrooms', String(dto.bedrooms));
    if (dto.bathrooms != null) form.append('bathrooms', String(dto.bathrooms));

    if (dto.pricePerPersonDay != null) form.append('pricePerPersonDay', String(dto.pricePerPersonDay));
    if (dto.dennyFee != null) form.append('dennyFee', String(dto.dennyFee));

    form.append('status', String(dto.status));

    // Amenities (repeat key)
    if (dto.amenities?.length) {
      for (const a of dto.amenities) form.append('amenities', String(a));
    }

    // ✅ Existing image paths to keep (repeat key)
    // Če backend pričakuje drugo ime (npr. "existingImages"), samo spremeni tukaj.
    if (dto.existingImagePaths?.length) {
      for (const p of dto.existingImagePaths) form.append('existingImagePaths', p);
    }

    // ✅ New images (repeat key)
    if (dto.images?.length) {
      for (const file of dto.images) form.append('images', file, file.name);
    }

    return form;
  }
}
