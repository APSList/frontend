// booking.types.ts

export type ReservationStatusEnum =
  | 'CREATED'
  | 'CONFIRMED'
  | 'PAYMENT_REQUIRED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export const BOOKING_STATUS_VALUES = [
  'CREATED',
  'CONFIRMED',
  'PAYMENT_REQUIRED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
] as const;

// This matches ReservationResponse from Go
export interface Reservation {
  id: number;
  organizationId: number;
  propertyId: number;
  propertyName?: string; // Optional if joined
  customerId: number;
  customerName?: string; // Optional if joined

  startDate: string; // ISO string
  endDate: string;   // ISO string

  totalPrice: number;
  status: ReservationStatusEnum;

  noOfGuests: number;
  priceElements?: Record<string, unknown>;
  guestData?: Record<string, unknown>;
  additionalRequests?: Record<string, unknown>;

  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  paymentUrl?: string; // Optional, from backend field
}

// This matches ReservationRequest from Go
export interface ReservationRequest {
  organizationId: number;
  propertyId: number;
  customerId: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  totalPrice: number;
  status: ReservationStatusEnum;
  noOfGuests: number;
  priceElements?: Record<string, unknown>;
  guestData?: Record<string, unknown>;
  additionalRequests?: Record<string, unknown>;
}

// For status updates
export interface BookingStatusUpdateDTO {
  status: ReservationStatusEnum;
}
