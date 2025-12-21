import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

interface Property {
  id: number;
  name: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE';
  maxGuests: number;
}

@Component({
  standalone: true,
  selector: 'property-list',
  templateUrl: './property-list.html',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ]
})
export class PropertyList {

  constructor(private router: Router) {}

  // 🔹 MOCK DATA
  properties = signal<Property[]>([
    { id: 1, name: 'Sea View Apartment', country: 'Croatia', status: 'ACTIVE', maxGuests: 4 },
    { id: 2, name: 'Mountain Cabin', country: 'Austria', status: 'INACTIVE', maxGuests: 6 },
    { id: 3, name: 'City Studio', country: 'Slovenia', status: 'ACTIVE', maxGuests: 2 }
  ]);

  // 🔹 FILTER STATE
  nameFilter = signal('');
  statusFilter = signal<'ACTIVE' | 'INACTIVE' | null>(null);

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];

  // 🔹 FILTERED DATA
  filteredProperties = computed(() =>
    this.properties().filter(p => {
      const nameOk =
        !this.nameFilter() ||
        p.name.toLowerCase().includes(this.nameFilter().toLowerCase());

      const statusOk =
        !this.statusFilter() || p.status === this.statusFilter();

      return nameOk && statusOk;
    })
  );

  // ➕ ADD NEW
  create() {
    this.router.navigate(['/properties/new']);
  }

  // 👁️ DETAILS
  openDetails(p: Property) {
    this.router.navigate(['/properties', p.id]);
  }

  // 🗑️ DELETE (UI ONLY)
  delete(id: number) {
    if (!confirm('Delete property?')) return;

    this.properties.update(list =>
      list.filter(p => p.id !== id)
    );
  }
}
