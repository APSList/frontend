import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard.component';
import { BookingList } from './pages/bookings/booking-list';
import { CustomerList } from './pages/customers/customers-list.component';
import { UsersList } from './pages/users/users-list.component';
import { DashboardCustomer } from './pages/dashboard-customer/dashboard-customer';
import { PropertyList } from './pages/properties/property-list/property-list';
import { PropertyDetail } from './pages/properties/property-detail/property-detail';
import { BookingDetails } from './pages/bookings/details/booking-details';
import { authGuard } from './core/guards/auth-guard';
import { LoginComponent } from "./pages/login/login";
import {PaymentsListComponent} from "./pages/payments/payments-list.component";
import {PaymentSuccessComponent} from "./pages/payment-success/payment-success";
import {PaymentCancelComponent} from "./pages/payment-cancel/payment-cancel";

export const routes: Routes = [
  // 1. Public Routes (e.g., Login)
  {
    path: 'login',
    component: LoginComponent, // You'll need to create/import this
  },
  { path: 'dashboard-customer', component: DashboardCustomer },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-cancel', component: PaymentCancelComponent },

  // 2. Protected Routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'dashboard-customer', component: DashboardCustomer },
      { path: 'bookings', component: BookingList },
      { path: 'bookings/:id', component: BookingDetails },
      { path: 'properties', component: PropertyList },
      { path: 'properties/new', component: PropertyDetail },
      { path: 'properties/:id', component: PropertyDetail },
      { path: 'payments', component: PaymentsListComponent },
      { path: 'customers', component: CustomerList },
      { path: 'users', component: UsersList },
    ]
  },
];
