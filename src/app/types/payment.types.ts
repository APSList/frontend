// payment.types.ts (camelCase everywhere)

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'failed'
  | string;

export interface Payment {
  id: number;

  organizationId: number | null;
  sessionId: string;

  reservationId: number | null;
  customerId: number | null;

  amount: number | null;

  paymentIntentId: string;
  paymentMethod: string;

  status: PaymentStatus;

  createdAt: string | null; // ISO string
  updatedAt: string | null; // ISO string

  createdBy: string;
  updatedBy: string;
}

export interface PaymentListQuery {
  search?: string | null;        // sessionId OR paymentIntentId
  status?: string | null;
  paymentMethod?: string | null;

  customerId?: number | null;
  reservationId?: number | null;

  sortField?: string | null;     // e.g. "createdAt", "amount", ...
  sortOrder?: 1 | -1 | null;     // PrimeNG sort order

  page?: number | null;
  pageSize?: number | null;
}

export interface PaymentUpsertRequestDTO {
  organizationId?: number | null;
  sessionId?: string;

  reservationId?: number | null;
  customerId?: number | null;

  amount?: number | null;

  paymentIntentId?: string;
  paymentMethod?: string;

  status?: string;
}
