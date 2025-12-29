// property-list.ts

import { Component, signal, inject, computed, DestroyRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  catchError,
  finalize,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PropertyGraphqlService } from '../../../services/property-graphql.service';
import { PropertyRestService } from '../../../services/property-rest.service';
import type {Property, PropertyStatusEnum} from '../../../types/property.types';

import type {
  PropertyFilterInput,
  PropertySortInput,
  SortDirection,
} from '../../../types/property.graphql.types';
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";

type SortField =
  | 'name'
  | 'country'
  | 'status'
  | 'maxGuests'
  | 'pricePerPersonDay'
  | 'updatedAt';

@Component({
  standalone: true,
  selector: 'property-list',
  templateUrl: './property-list.html',
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    FormsModule,
    IconField,
    InputIcon,
  ],
})
export class PropertyList implements OnInit {
  private router = inject(Router);
  private propertyGraphqlService = inject(PropertyGraphqlService);
  private rest = inject(PropertyRestService);
  private destroyRef = inject(DestroyRef);

  properties = signal<Property[]>([]);
  /** ✅ vedno kopija za PrimeNG (da lahko sortira/operira brez “read-only” errorjev) */
  rows = computed<Property[]>(() => [...this.properties()]);

  loading = signal(false);
  error = signal<string | null>(null);

  nameFilter = signal('');
  statusFilter = signal<string | null>(null);
  countryFilter = signal('');

  statusOptions = [
    { label: 'Available', value: 'Available' },
    { label: 'SoldOut', value: 'SoldOut' },
    { label: 'Closed', value: 'Closed' },
  ];

  sortField = signal<SortField>('updatedAt');
  sortOrder = signal<1 | -1>(-1);

  private reload$ = new Subject<void>();

  private queryKey = computed(() =>
    JSON.stringify({
      name: this.nameFilter().trim(),
      country: this.countryFilter().trim(),
      status: this.statusFilter(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
    })
  );

  ngOnInit() {
    this.reload$
      .pipe(
        debounceTime(150),
        map(() => this.queryKey()),
        distinctUntilChanged(),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => {
          const where = this.buildWhere();
          const order = this.buildOrder();

          return this.propertyGraphqlService.getGridProperties(where, order).pipe(
            catchError((err) => {
              console.error(err);
              this.error.set('Failed to load properties.');
              return of([] as Property[]);
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => this.properties.set(rows ?? []));

    this.reload();
  }

  create() {
    this.router.navigate(['/properties/new']);
  }

  openDetails(p: Property) {
    this.router.navigate(['/properties', p.id]);
  }

  clearFilters() {
    this.nameFilter.set('');
    this.statusFilter.set(null);
    this.countryFilter.set('');
    this.reload();
  }

  onNameInput(value: string) {
    this.nameFilter.set(value);
    this.reload();
  }

  onCountryInput(value: string) {
    this.countryFilter.set(value);
    this.reload();
  }

  onStatusChange(value: string | null) {
    this.statusFilter.set(value);
    this.reload();
  }

  /** ✅ PrimeNG customSort uporablja sortFunction — mi tu samo shranimo in reloadamo */
  onSort(event: { field: string; order: 1 | -1 }) {
    this.sortField.set(event.field as SortField);
    this.sortOrder.set(event.order);
    this.reload();
  }

  /** handler za (sortFunction) — samo preusmeri na onSort */
  onSortFunction(event: any) {
    this.onSort({ field: event.field, order: event.order });
  }

  delete(id: number) {
    if (!confirm('Delete property?')) return;

    this.loading.set(true);
    this.error.set(null);

    this.rest
      .delete(id)
      .pipe(
        catchError((err) => {
          console.error(err);
          this.error.set('Delete failed.');
          return of(void 0);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.reload());
  }

  reload() {
    this.reload$.next();
  }

  private buildWhere(): PropertyFilterInput | null {
    const and: PropertyFilterInput[] = [];

    const name = this.nameFilter().trim();
    if (name) and.push({ name: { contains: name } });

    const country = this.countryFilter().trim();
    if (country) and.push({ country: { contains: country } });

    const status = this.statusFilter();
    if (status) and.push({ status: { eq: status } });

    return and.length ? { and } : null;
  }

  private buildOrder(): PropertySortInput[] {
    const field = this.sortField();
    const dir: SortDirection = this.sortOrder() === 1 ? 'ASC' : 'DESC';
    return [{ [field]: dir } as PropertySortInput];
  }

  statusSeverity(status: PropertyStatusEnum): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Available':
        return 'success';
      case 'SoldOut':
        return 'warn';
      case 'Closed':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  typeLabel(p: Property): string {
    return (p.propertyType ?? '').toString();
  }

  capacityLabel(p: Property): string {
    const g = p.maxGuests ?? 0;
    const b = p.bedrooms ?? 0;
    const ba = p.bathrooms ?? 0;
    return `${g} guests • ${b} bed • ${ba} bath`;
  }
}
