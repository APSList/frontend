import { Component, OnInit, signal, inject } from '@angular/core';
import { BookingRestService } from '../../services/booking-rest.service'; // Adjust path
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  selector: 'app-customer-list',
  templateUrl: './customers-list.component.html'
})
export class CustomerList implements OnInit {
  private customerService = inject(BookingRestService);

  // Use signals as your template expects
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load customers');
        this.loading.set(false);
      }
    });
  }

  addNew() {
    // Logic to navigate to creation form or open dialog
  }
}
