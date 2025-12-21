import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {BookingsComponent} from "./pages/bookings/bookings";
import {PaymentsComponent} from "./pages/payments/payments.component";
import {CustomersComponent} from "./pages/customers/customers.component";
import {UsersComponent} from "./pages/users/users.component";
import {DashboardCustomerComponent} from "./pages/dashboard-customer/dashboard-customer";
import {PropertyList} from "./pages/properties/property-list/property-list";
import {PropertyForm} from "./pages/properties/property-form/property-form";
import {PropertyDetail} from "./pages/properties/property-detail/property-detail";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'dashboard-customer',
    component: DashboardCustomerComponent
  },
  {
    path: 'bookings',
    component: BookingsComponent
  },
  { path: 'properties', component: PropertyList },
  { path: 'properties/new', component: PropertyForm },
  { path: 'properties/:id', component: PropertyDetail },
  { path: 'properties/:id/edit', component: PropertyForm },
  {
    path: 'payments',
    component: PaymentsComponent
  },
  {
    path: 'customers',
    component: CustomersComponent
  },
  {
    path: 'users',
    component: UsersComponent
  }
];
