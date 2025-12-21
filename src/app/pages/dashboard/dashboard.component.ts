import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';

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
export class DashboardComponent {
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
