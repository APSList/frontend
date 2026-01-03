import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import type {
  Property,
  PropertyStatusEnum,
  PropertyTypeEnum,
  PropertyUpsertRequestDTO
} from '../../../types/property.types';

import {
  PROPERTY_TYPE_VALUES,
  PROPERTY_STATUS_VALUES
} from '../../../types/property.types';

import { PropertyRestService } from '../../../services/property-rest.service';
import {PropertyImageUploader} from "../../../components/property-image-uploader/property-image-uploader";

@Component({
  standalone: true,
  selector: 'property-detail',
  templateUrl: './property-detail.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    TagModule,
    PropertyImageUploader
  ]
})
export class PropertyDetail {
  @ViewChild(PropertyImageUploader) uploader?: PropertyImageUploader;

  editMode = signal(false);
  isNew = signal(false);
  loading = signal(false);
  saving = signal(false);

  readonly propertyTypeOptions = PROPERTY_TYPE_VALUES.map(v => ({ label: v, value: v }));
  readonly propertyStatusOptions = PROPERTY_STATUS_VALUES.map(v => ({ label: v, value: v }));

  property = signal<Property>({
    id: 0,
    organizationId: 0,
    name: '',
    description: null,
    address: null,
    country: null,
    propertyType: 'Apartment',
    maxGuests: null,
    bedrooms: null,
    bathrooms: null,
    pricePerPersonDay: null,
    dennyFee: null,
    status: 'Available',
    createdAt: new Date().toISOString(),
    createdBy: null,
    updatedAt: new Date().toISOString(),
    updatedBy: null,
    propertyImages: [],
    propertyAmenities: []
  });

  form: FormGroup;

  private readonly editableControls = [
    'name',
    'country',
    'address',
    'description',
    'propertyType',
    'status',
    'maxGuests',
    'bedrooms',
    'bathrooms',
    'pricePerPersonDay',
    'dennyFee'
  ] as const;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly api: PropertyRestService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      country: [''],
      address: [''],
      description: [''],
      propertyType: ['Apartment' as PropertyTypeEnum, Validators.required],
      status: ['Available' as PropertyStatusEnum, Validators.required],
      maxGuests: [null, [Validators.min(1), Validators.max(50)]],
      bedrooms: [null, [Validators.min(0), Validators.max(30)]],
      bathrooms: [null, [Validators.min(0), Validators.max(30)]],
      pricePerPersonDay: [null, [Validators.min(0)]],
      dennyFee: [null, [Validators.min(0)]],
      updatedAt: [{ value: '', disabled: true }],
      updatedBy: [{ value: '', disabled: true }]
    });

    this.form.disable();
    queueMicrotask(() => this.initFromRoute());
  }

  private async initFromRoute(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');

    // ✅ CREATE
    if (!idParam || idParam === 'new') {
      this.isNew.set(true);
      this.editMode.set(true);
      this.enableEditableOnly();

      const now = new Date().toISOString();
      this.property.set({
        ...this.property(),
        id: 0,
        name: '',
        address: '',
        country: '',
        description: '',
        propertyType: 'Apartment',
        status: 'Available',
        createdAt: now,
        updatedAt: now,
        propertyImages: []
      });

      this.form.patchValue({
        name: '',
        country: '',
        address: '',
        description: '',
        propertyType: 'Apartment',
        status: 'Available',
        maxGuests: null,
        bedrooms: null,
        bathrooms: null,
        pricePerPersonDay: null,
        dennyFee: null,
        updatedAt: now,
        updatedBy: ''
      });

      return;
    }

    // ✅ DETAIL
    const id = Number(idParam);
    if (!Number.isFinite(id)) return;

    this.loading.set(true);
    try {
      const p = await firstValueFrom(this.api.get(id));
      this.property.set(p);

      this.form.patchValue({
        name: p.name,
        country: p.country ?? '',
        address: p.address ?? '',
        description: p.description ?? '',
        propertyType: (p.propertyType ?? 'Apartment') as PropertyTypeEnum,
        status: p.status,
        maxGuests: p.maxGuests ?? null,
        bedrooms: p.bedrooms ?? null,
        bathrooms: p.bathrooms ?? null,
        pricePerPersonDay: p.pricePerPersonDay ?? null,
        dennyFee: p.dennyFee ?? null,
        updatedAt: p.updatedAt,
        updatedBy: p.updatedBy ?? ''
      });

      this.form.disable();
      this.editMode.set(false);
      this.isNew.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  private enableEditableOnly(): void {
    this.form.disable();
    for (const key of this.editableControls) this.form.get(key)?.enable();
  }

  toggleEdit(): void {
    const next = !this.editMode();
    this.editMode.set(next);

    if (next) {
      const p = this.property();
      this.form.patchValue({
        name: p.name,
        country: p.country ?? '',
        address: p.address ?? '',
        description: p.description ?? '',
        propertyType: (p.propertyType ?? 'Apartment') as PropertyTypeEnum,
        status: p.status,
        maxGuests: p.maxGuests ?? null,
        bedrooms: p.bedrooms ?? null,
        bathrooms: p.bathrooms ?? null,
        pricePerPersonDay: p.pricePerPersonDay ?? null,
        dennyFee: p.dennyFee ?? null,
        updatedAt: p.updatedAt,
        updatedBy: p.updatedBy ?? ''
      });

      this.enableEditableOnly();
    } else {
      this.form.disable();
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.uploader) return;

    this.saving.set(true);
    try {
      const v = this.form.getRawValue();

      // get images payload from uploader
      const imgPayload = this.uploader.getUpsertImagesPayload();

      const dto: PropertyUpsertRequestDTO = {
        name: v.name,
        description: v.description ?? null,
        address: v.address ?? null,
        country: v.country ?? null,
        propertyType: v.propertyType,
        status: v.status,
        maxGuests: v.maxGuests ?? null,
        bedrooms: v.bedrooms ?? null,
        bathrooms: v.bathrooms ?? null,
        pricePerPersonDay: v.pricePerPersonDay ?? null,
        dennyFee: v.dennyFee ?? null,
        amenities: null,

        // ✅ ključna zadeva za tvoj backend flow
        existingImagePaths: imgPayload.existingImagePaths,
        images: imgPayload.images
      };

      let id: number;

      if (this.isNew()) {
        id = await firstValueFrom(this.api.create(dto));
        // po create: navigiraj na details route
        this.router.navigate(['/properties', id]);
        this.isNew.set(false);
      } else {
        id = this.property().id;
        await firstValueFrom(this.api.update(id, dto));
      }

      // ✅ refresh, da dobiš prave storagePath-e iz backend-a
      const refreshed = await firstValueFrom(this.api.get(id));
      this.property.set(refreshed);

      // refresh form read-only fields
      this.form.patchValue({
        updatedAt: refreshed.updatedAt,
        updatedBy: refreshed.updatedBy ?? ''
      });

      this.editMode.set(false);
      this.form.disable();
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    this.router.navigate(['/properties']);
  }

  statusSeverity(status: PropertyStatusEnum): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'Available': return 'success';
      case 'SoldOut': return 'warn';
      case 'Closed': return 'danger';
      default: return 'warn';
    }
  }
}
