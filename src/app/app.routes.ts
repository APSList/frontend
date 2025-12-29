import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard.component';
import {BookingsList} from "./pages/bookings/bookings";
import {PaymentsList} from "./pages/payments/payments-list.component";
import {CustomersList} from "./pages/customers/customers-list.component";
import {UsersList} from "./pages/users/users-list.component";
import {DashboardCustomer} from "./pages/dashboard-customer/dashboard-customer";
import {PropertyList} from "./pages/properties/property-list/property-list";
import {PropertyDetail} from "./pages/properties/property-detail/property-detail";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'dashboard-customer',
    component: DashboardCustomer
  },
  {
    path: 'bookings',
    component: BookingsList
  },
  { path: 'properties', component: PropertyList },
  { path: 'properties/new', component: PropertyDetail },
  { path: 'properties/:id', component: PropertyDetail },
  {
    path: 'payments',
    component: PaymentsList
  },
  {
    path: 'customers',
    component: CustomersList
  },
  {
    path: 'users',
    component: UsersList
  }
];
