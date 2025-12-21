import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { GalleriaModule } from 'primeng/galleria';
import { FileUploadModule } from 'primeng/fileupload';

interface Property {
  id: number;
  name: string;
  country: string;
  description: string;
  maxGuests: number;
  images: string[];
}

@Component({
  standalone: true,
  selector: 'property-detail',
  templateUrl: './property-detail.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,   // 👈 OBVEZNO
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    GalleriaModule,
    FileUploadModule
  ]
})
export class PropertyDetail {

  editMode = signal(false);

  property = signal<Property>({
    id: 1,
    name: 'Sea View Apartment',
    country: 'Croatia',
    description: 'Beautiful apartment with sea view.',
    maxGuests: 4,
    images: [
      'https://picsum.photos/800/500?1',
      'https://picsum.photos/800/500?2'
    ]
  });

  form: FormGroup;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder
  ) {
    const p = this.property();

    this.form = this.fb.group({
      name: [p.name],
      country: [p.country],
      description: [p.description],
      maxGuests: [p.maxGuests]
    });
  }

  toggleEdit(): void {
    this.editMode.update(v => !v);

    if (this.editMode()) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  save(): void {
    this.property.update(p => ({
      ...p,
      ...this.form.value
    }));

    this.editMode.set(false);
    this.form.disable();
  }

  back(): void {
    this.router.navigate(['/properties']);
  }

  removeImage(index: number): void {
    this.property.update(p => ({
      ...p,
      images: p.images.filter((_, i) => i !== index)
    }));
  }

  addImage(event: any): void {
    const file: File | undefined = event.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.property.update(p => ({
        ...p,
        images: [...p.images, reader.result as string]
      }));
    };

    reader.readAsDataURL(file);
  }
}
