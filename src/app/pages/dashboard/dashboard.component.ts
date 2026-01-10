import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { BookingRestService } from '../../services/booking-rest.service';
import { Reservation } from '../../types/booking.types';
import {PropertyGraphqlService} from "../../services/property-graphql.service";
import { TooltipModule } from "primeng/tooltip";
import {PropertyRestService} from "../../services/property-rest.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    DatePickerModule,
    TagModule,
    TooltipModule
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
    const year = date.year;
    const month = String(date.month + 1).padStart(2, '0');
    const day = String(date.day).padStart(2, '0');
    const calendarDateStr = `${year}-${month}-${day}`;


    const match = this.bookings().find(b => {
      // If your backend sends a full ISO string, extract just the date part
      const bookingDateStr = b.check_in_date?.split('T')[0];
      console.log(bookingDateStr);
      return bookingDateStr === calendarDateStr;
    });

    return match ? match.status : null;
  }

  workerTasks = computed(() => {
    const tasks: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the current values of both signals
    const allBookings = this.bookings();
    const allProperties = this.properties();

    allBookings.forEach(b => {
      // 1. Find the property name from the existing properties signal
      // @ts-ignore
      const id = b.propertyId || b["property_id"];
      const property = allProperties.find(p => p.id === id);
      const propertyName = property ? property.name : `Property #${id}`;

      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);

      // 2. Add Check-In Task
      if (checkIn >= today) {
        tasks.push({
          bookingId: b.id,
          type: 'CHECK-IN',
          date: checkIn,
          propertyName: propertyName
        });
      }

      // 3. Add Check-Out Task
      if (checkOut >= today) {
        tasks.push({
          bookingId: b.id,
          type: 'CHECK-OUT',
          date: checkOut,
          propertyName: propertyName
        });
      }
    });

    // Sort by date (soonest first) and take the top 10
    return tasks.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);
  });

  upcomingArrivalsCount = computed(() => {
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    return this.bookings().filter(booking => {
      // Use raw.check_in_date or raw.start_date based on your API
      const check_in_dateStr = booking.check_in_date || (booking as any).start_date;
      if (!check_in_dateStr) return false;

      const checkInDate = new Date(check_in_dateStr);
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

  calendarEvents = computed(() => {
    const eventMap: Record<string, { type: string, status: string }[]> = {};

    this.bookings().forEach(b => {
      if (b.status == 'CONFIRMED') {
        // 1. Normalize Check-in Date
        const inDate = b.check_in_date?.split('T')[0];
        if (inDate) {
          if (!eventMap[inDate]) eventMap[inDate] = [];
          eventMap[inDate].push({ type: 'IN', status: b.status });
        }

        // 2. Normalize Check-out Date
        const outDate = b.check_out_date?.split('T')[0];
        if (outDate) {
          if (!eventMap[outDate]) eventMap[outDate] = [];
          eventMap[outDate].push({ type: 'OUT', status: b.status });
        }
      }
    });

    return eventMap;
  });

// Helper for the template
  getDayEvents(date: any) {
    const key = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    return this.calendarEvents()[key] || [];
  }

  stats = {
    activeBookings: 18,
    upcomingArrivals: 6,
    revenue: 12345,
    units: 24
  };
}
