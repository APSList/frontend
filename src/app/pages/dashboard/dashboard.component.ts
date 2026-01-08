import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { BookingRestService } from '../../services/booking-rest.service';
import { Reservation } from '../../types/booking.types';
import {PropertyGraphqlService} from "../../services/property-graphql.service";

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
  private propertyService = inject(PropertyGraphqlService);

  properties = signal<any[]>([]);

  bookings = signal<Reservation[]>([]);
  loading = signal(false);


  totalUnitsCount = computed(() => this.properties().length);

  activeBookingsCount = computed(() => {
    return this.bookings().filter(b =>
      b.status !== 'CANCELLED' &&
      b.status !== 'COMPLETED'
    ).length;
  });

  getBookingStatus(date: any): string | null {
    if (!date) return null;

    // Create a string to compare (YYYY-MM-DD)
    const cellDate = new Date(date.year, date.month, date.day).toDateString();

    const booking = this.bookings().find(b => {
      const bDateStr = (b as any).start_date || b.startDate;
      return bDateStr ? new Date(bDateStr).toDateString() === cellDate : false;
    });

    return booking ? booking.status : null;
  }

  upcomingArrivalsCount = computed(() => {
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    return this.bookings().filter(booking => {
      // Use raw.startDate or raw.start_date based on your API
      const startDateStr = booking.startDate || (booking as any).start_date;
      if (!startDateStr) return false;

      const checkInDate = new Date(startDateStr);
      return checkInDate >= now && checkInDate <= oneMonthFromNow;
    }).length;
  });

  loadProperties() {
    // Fetch properties from your GraphQL service
    this.propertyService.getGridProperties().subscribe({
      next: (data) => {
        this.properties.set(data);
      },
      error: (err) => console.error('Error loading properties:', err)
    });
  }

  monthlyRevenue = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.bookings()
      .filter(booking => {
        // Use created_at (snake_case) or createdAt
        const createdDateStr = (booking as any).created_at || booking.createdAt;
        if (!createdDateStr) return false;

        const createdDate = new Date(createdDateStr);
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear &&
          booking.status !== 'CANCELLED' // Usually revenue ignores cancelled bookings
        );
      })
      .reduce((sum, booking) => {
        // Handle snake_case total_price or camelCase totalPrice
        const price = (booking as any).total_price || booking.totalPrice || 0;
        return sum + price;
      }, 0);
  });

  ngOnInit() {
    this.loadBookings();
    this.loadProperties();
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
