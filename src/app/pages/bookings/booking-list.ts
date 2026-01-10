import { Component, signal, inject, OnInit, DestroyRef, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { BookingRestService } from '../../services/booking-rest.service';
import { PropertyRestService } from '../../services/property-rest.service';
import type { Reservation } from '../../types/booking.types';

interface ReservationDisplay {
  id: number;
  propertyId: number;
  propertyName?: string;
  customerId: number;
  customerName?: string;
  status: string;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
}

@Component({
  standalone: true,
  selector: 'booking-list',
  templateUrl: './booking-list.html',
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    TagModule,
  ],
})
export class BookingList implements OnInit {
  private router = inject(Router);
  private bookingRest = inject(BookingRestService);
  private destroyRef = inject(DestroyRef);
  private propertyRest = inject(PropertyRestService);

  bookings = signal<Reservation[]>([]);
  rows = computed(() => [...this.bookings()]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.error.set(null);

    this.bookingRest.getAll().subscribe({
      next: (res) => {
        const bookings: ReservationDisplay[] = (res ?? []).map((b: any) => ({
          id: b.id,
          propertyId: b.property_id,
          propertyName: "",
          customerId: b.customer_id,
          customerName: "",
          status: b.status,
          totalPrice: b.total_price,
          checkInDate: b.check_in_date,
          checkOutDate: b.check_out_date,
        }));
        this.bookings.set(bookings as any);

        this.loadPropertyNames(bookings);
        this.loadCustomerNames(bookings);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load bookings.');
      },
      complete: () => this.loading.set(false),
    });
  }

  addNew() {
    this.router.navigate(['/bookings/new']);
  }

  openDetails(b: Reservation) {
    this.router.navigate(['/bookings', b.id]);
  }

  private loadPropertyNames(rows: ReservationDisplay[]) {
    const uniqueIds = [...new Set(rows.map(r => r.propertyId))];

    uniqueIds.forEach(id => {
      this.propertyRest.get(id).subscribe({
        next: (prop) => {
          // update signal state immutably
          this.bookings.update(list =>
            list.map(row =>
              row.propertyId === id ? { ...row, propertyName: prop.name } : row
            )
          );
        },
        error: (err) => console.error(`Failed to load property ${id}`, err)
      });
    });
  }

  private loadCustomerNames(rows: ReservationDisplay[]) {
    // get all unique customer IDs
    const uniqueIds = [...new Set(rows.map(r => r.customerId))];

    uniqueIds.forEach(id => {
      this.bookingRest.getCustomerById(id).subscribe({
        next: (customer) => {
          // update bookings signal immutably
          this.bookings.update(list =>
            list.map(row =>
              row.customerId === id ? { ...row, customerName: customer.full_name } : row
            )
          );
        },
        error: (err) => console.error(`Failed to load customer ${id}`, err)
      });
    });
  }

}
