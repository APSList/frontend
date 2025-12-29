import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { GalleriaModule } from 'primeng/galleria';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

import type { Property, PropertyImage } from '../../types/property.types';

type HostInfo = {
  propertyId: number;
  hostName: string; // ✅ kdo oddaja
};

type BookedRange = {
  from: string; // ISO date yyyy-mm-dd
  to: string;   // ISO date yyyy-mm-dd (inclusive for mock)
};

@Component({
  standalone: true,
  selector: 'dashboard-customer',
  templateUrl: './dashboard-customer.html',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    GalleriaModule,
    DatePickerModule,
    ToggleSwitchModule,
    TagModule,
    DividerModule,
    InputTextModule
  ]
})
export class DashboardCustomer {
  /**
   * ✅ Page je mock, ampak property modeli že obstajajo.
   * Zato omogočam, da starš poda properties, če želi.
   * Če jih ne poda, uporabimo mock list spodaj.
   */
  @Input() set propertiesInput(value: Property[] | null | undefined) {
    if (value?.length) this.properties.set(value);
  }

  // ======= MOCK PROPERTIES (uporabi tvoj Property model) =======
  readonly properties = signal<Property[]>([
    this.p(101, 'Old Town Loft with River View', 'Ljubljana, Slovenia', [
      this.img(1, 101, 'https://picsum.photos/seed/air-101-1/1200/800'),
      this.img(2, 101, 'https://picsum.photos/seed/air-101-2/1200/800'),
      this.img(3, 101, 'https://picsum.photos/seed/air-101-3/1200/800')
    ], 32, 4.92),
    this.p(102, 'Modern Studio · Walk to Center', 'Ljubljana, Slovenia', [
      this.img(1, 102, 'https://picsum.photos/seed/air-102-1/1200/800'),
      this.img(2, 102, 'https://picsum.photos/seed/air-102-2/1200/800'),
      this.img(3, 102, 'https://picsum.photos/seed/air-102-3/1200/800')
    ], 24, 4.78),
    this.p(103, 'Lake Cabin · Quiet + Sauna', 'Bohinj, Slovenia', [
      this.img(1, 103, 'https://picsum.photos/seed/air-103-1/1200/800'),
      this.img(2, 103, 'https://picsum.photos/seed/air-103-2/1200/800'),
      this.img(3, 103, 'https://picsum.photos/seed/air-103-3/1200/800')
    ], 44, 4.95),
    this.p(104, 'Vineyard House · Sunset Terrace', 'Vipava, Slovenia', [
      this.img(1, 104, 'https://picsum.photos/seed/air-104-1/1200/800'),
      this.img(2, 104, 'https://picsum.photos/seed/air-104-2/1200/800'),
      this.img(3, 104, 'https://picsum.photos/seed/air-104-3/1200/800')
    ], 38, 4.86),
    this.p(105, 'Coastal Apartment · Sea Breeze', 'Piran, Slovenia', [
      this.img(1, 105, 'https://picsum.photos/seed/air-105-1/1200/800'),
      this.img(2, 105, 'https://picsum.photos/seed/air-105-2/1200/800'),
      this.img(3, 105, 'https://picsum.photos/seed/air-105-3/1200/800')
    ], 35, 4.81),
    this.p(106, 'Mountain View Flat · Near Trails', 'Kranjska Gora, Slovenia', [
      this.img(1, 106, 'https://picsum.photos/seed/air-106-1/1200/800'),
      this.img(2, 106, 'https://picsum.photos/seed/air-106-2/1200/800'),
      this.img(3, 106, 'https://picsum.photos/seed/air-106-3/1200/800')
    ], 28, 4.74)
  ]);

  // ✅ host/ponudnik (hardcoded)
  readonly hosts = signal<HostInfo[]>([
    { propertyId: 101, hostName: 'Alenka Novak' },
    { propertyId: 102, hostName: 'Matej Kovač' },
    { propertyId: 103, hostName: 'Bohinj Retreats' },
    { propertyId: 104, hostName: 'Vina Vipava' },
    { propertyId: 105, hostName: 'Maja Marin' },
    { propertyId: 106, hostName: 'Alpine Stay' }
  ]);

  // ✅ mock zasedenost: samo intervali, brez “by”
  readonly bookedByProperty = signal<Record<number, BookedRange[]>>({
    101: [
      { from: '2026-01-05', to: '2026-01-08' },
      { from: '2026-01-18', to: '2026-01-20' }
    ],
    102: [{ from: '2026-01-12', to: '2026-01-14' }],
    103: [
      { from: '2026-01-02', to: '2026-01-06' },
      { from: '2026-01-22', to: '2026-01-26' }
    ],
    104: [{ from: '2026-01-10', to: '2026-01-12' }],
    105: [{ from: '2026-01-15', to: '2026-01-19' }],
    106: []
  });

  // ======= FILTER UI =======
  readonly q = signal('');
  readonly onlyAvailable = signal(false);

  // global date range filter
  readonly range = signal<[Date | null, Date | null]>([null, null]);
  get rangeModel(): Date[] | null {
    const [a, b] = this.range();
    return a || b ? ([a ?? null, b ?? null] as any) : null;
  }
  set rangeModel(v: Date[] | null) {
    const a = v?.[0] ?? null;
    const b = v?.[1] ?? null;
    this.range.set([a, b]);
  }

  // per-card image index state (so swipe/click works nicely)
  readonly cardIndexById = signal<Record<number, number>>({});
  cardIndex(id: number): number {
    return this.cardIndexById()[id] ?? 0;
  }
  setCardIndex(id: number, idx: number): void {
    const safe = Number.isFinite(idx) ? Math.max(0, Math.trunc(idx)) : 0;
    this.cardIndexById.set({ ...this.cardIndexById(), [id]: safe });
  }

  // details dialog
  readonly detailsOpen = signal(false);
  readonly selectedId = signal<number | null>(null);

  // details range can be set separately (starts from global range)
  readonly detailsRange = signal<[Date | null, Date | null]>([null, null]);
  get detailsRangeModel(): Date[] | null {
    const [a, b] = this.detailsRange();
    return a || b ? ([a ?? null, b ?? null] as any) : null;
  }
  set detailsRangeModel(v: Date[] | null) {
    const a = v?.[0] ?? null;
    const b = v?.[1] ?? null;
    this.detailsRange.set([a, b]);
  }

  readonly selectedProperty = computed(() => {
    const id = this.selectedId();
    return id ? this.properties().find(p => p.id === id) ?? null : null;
  });

  readonly selectedHost = computed(() => {
    const id = this.selectedId();
    return id ? this.hosts().find(h => h.propertyId === id)?.hostName ?? '—' : '—';
  });

  readonly selectedBookings = computed(() => {
    const id = this.selectedId();
    return id ? (this.bookedByProperty()[id] ?? []) : [];
  });

  readonly filteredProperties = computed(() => {
    const props = this.properties();
    const query = this.q().trim().toLowerCase();
    const onlyAvail = this.onlyAvailable();
    const [start, end] = this.range();

    return props.filter(p => {
      const host = this.hosts().find(h => h.propertyId === p.id)?.hostName ?? '';

      const matchesText =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.address ?? '').toLowerCase().includes(query) ||
        (p.country ?? '').toLowerCase().includes(query) ||
        host.toLowerCase().includes(query);

      if (!matchesText) return false;

      if (onlyAvail && start && end) {
        return this.isAvailable(p.id, start, end);
      }
      return true;
    });
  });

  // ======= FLOWS =======
  openDetails(p: Property): void {
    this.selectedId.set(p.id);

    // start details range with global range if set
    const [a, b] = this.range();
    this.detailsRange.set([a, b]);

    this.detailsOpen.set(true);
  }

  closeDetails(): void {
    this.detailsOpen.set(false);
  }

  showOnlyAvailableFromDetails(): void {
    const [a, b] = this.detailsRange();
    this.range.set([a, b]);
    this.onlyAvailable.set(true);
    this.detailsOpen.set(false);
  }

  // ======= AVAILABILITY =======
  isAvailable(propertyId: number, start: Date, end: Date): boolean {
    const bookings = this.bookedByProperty()[propertyId] ?? [];
    const aStart = this.toMidnight(start);
    const aEnd = this.toMidnight(end);

    if (aEnd.getTime() < aStart.getTime()) return true;

    for (const b of bookings) {
      const bStart = this.toMidnight(this.parseISO(b.from));
      const bEnd = this.toMidnight(this.parseISO(b.to));
      if (this.overlapInclusive(aStart, aEnd, bStart, bEnd)) return false;
    }
    return true;
  }

  availabilityTag(propertyId: number, start: Date | null, end: Date | null): { label: string; severity: 'success' | 'danger' | 'secondary' } {
    if (!start || !end) return { label: 'Select dates', severity: 'secondary' };
    return this.isAvailable(propertyId, start, end)
      ? { label: 'Available', severity: 'success' }
      : { label: 'Booked', severity: 'danger' };
  }

  // ======= HELPERS =======
  hostNameFor(p: Property): string {
    return this.hosts().find(h => h.propertyId === p.id)?.hostName ?? '—';
  }

  coverUrls(p: Property): string[] {
    const imgs = (p.images ?? []) as PropertyImage[];
    const urls = imgs.map(i => i.storagePath).filter(Boolean);
    // fallback images if none
    if (!urls.length) return [
      `https://picsum.photos/seed/p-${p.id}-a/1200/800`,
      `https://picsum.photos/seed/p-${p.id}-b/1200/800`,
      `https://picsum.photos/seed/p-${p.id}-c/1200/800`
    ];
    return urls;
  }

  // your model uses pricePerPersonDay
  displayPrice(p: Property): string {
    const v = p.pricePerPersonDay ?? 0;
    return v > 0 ? `${v}€ / person · day` : 'Price on request';
  }

  private parseISO(s: string): Date {
    // treat as local date (yyyy-mm-dd)
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  private toMidnight(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private overlapInclusive(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart.getTime() <= bEnd.getTime() && bStart.getTime() <= aEnd.getTime();
  }

  // mock builder helpers
  private img(id: number, propertyId: number, storagePath: string): PropertyImage {
    return { id, propertyId, storagePath };
  }
  private p(id: number, name: string, address: string, images: PropertyImage[], pricePerPersonDay: number, rating: number): Property {
    const now = new Date().toISOString();
    return {
      id,
      organizationId: 1,
      name,
      address,
      country: 'Slovenia',
      status: 'Available',
      propertyType: 'Apartment',
      pricePerPersonDay,
      dennyFee: 0,
      createdAt: now,
      updatedAt: now,
      description: 'Mock description for customer dashboard.',
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      images,
      propertyAmenities: null
    } as Property & { __rating?: number };
  }

  // Optional rating mock (kept as local helper)
  ratingFor(p: Property): number {
    // we stored rating in the mock builder via casting; for real data, compute differently
    return (p as any).__rating ?? 4.8;
  }
}
