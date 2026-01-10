import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.html',
  standalone: true,
  styleUrls: ['./payment-cancel.css']
})
export class PaymentCancelComponent {

  constructor(private router: Router) {}

  onDashboardRedirect(): void {
    this.router.navigate(['/customer-dashboard']);
  }
}
