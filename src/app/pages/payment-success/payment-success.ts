import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.html',
  standalone: true,
  styleUrls: ['./payment-success.css']
})
export class PaymentSuccessComponent {
  constructor(private router: Router) {}

  onDashboardRedirect(): void {
    this.router.navigate(['/customer-dashboard']);
  }
}
