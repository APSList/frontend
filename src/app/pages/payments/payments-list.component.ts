import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PaymentRestService } from '../../services/payment-rest.service';
import { Payment } from '../../types/payment.types';

import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  templateUrl: './payments-list.component.html',
  imports: [Button, TableModule, Tag],
})
export class PaymentsListComponent {
  private paymentsRest = inject(PaymentRestService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rows = signal<Payment[]>([]);

  private listSub: Subscription | null = null;

  constructor() {
    this.reload();
  }

  reload(): void {
    // prekini prejšnji "list" request (če je bil v teku)
    this.listSub?.unsubscribe();
    this.listSub = null;

    this.loading.set(true);
    this.error.set(null);

    this.listSub = this.paymentsRest
      .list({})
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
          this.listSub = null;
        })
      )
      .subscribe({
        next: (data) => {
          this.rows.set(Array.isArray(data) ? data : []);
        },
        error: (err) => {
          this.error.set(this.toErrMsg(err));
          this.rows.set([]);
        },
      });
  }

  refresh(): void {
    this.reload();
  }

  create(): void {
    this.router.navigate(['payments', 'create']);
  }

  openDetails(p: Payment): void {
    this.router.navigate(['payments', p.id]);
  }

  delete(id: number): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.paymentsRest
      .delete(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => this.reload(),
        error: (err) => {
          this.error.set(this.toErrMsg(err));
        },
      });
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const s = (status ?? '').toLowerCase();
    if (s === 'succeeded') return 'success';
    if (s === 'processing') return 'info';
    if (s.startsWith('requires_')) return 'warn';
    if (s === 'failed') return 'danger';
    return 'secondary';
  }

  private toErrMsg(err: any): string {
    return err?.error?.message ?? err?.message ?? 'Something went wrong.';
  }
}
