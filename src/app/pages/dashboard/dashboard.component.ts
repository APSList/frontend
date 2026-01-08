import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { BookingRestService } from '../../services/booking-rest.service';
import { Reservation } from '../../types/booking.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    DatePickerModule,
    TagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class Dashboard implements OnInit {
  private bookingRest = inject(BookingRestService);

  bookings = signal<Reservation[]>([]);
  loading = signal(false);

  activeBookingsCount = computed(() => {
    return this.bookings().filter(b =>
      b.status !== 'CANCELLED' &&
      b.status !== 'COMPLETED'
    ).length;
  });

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.bookingRest.getAll().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  stats = {
    activeBookings: 18,
    upcomingArrivals: 6,
    revenue: 12345,
    units: 24
  };

  workerTasks = [
    { task: 'Cleaning',  property: 'Oceanview Apartment', assignedTo: 'John Smith' },
    { task: 'Check-in',  property: 'City Center Studio', assignedTo: 'Jane Doe' },
    { task: 'Upcoming',  property: 'Lakeside Condo',     assignedTo: 'Alice Johnson' }
  ];
}
