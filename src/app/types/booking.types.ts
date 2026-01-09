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

  check_in_date: string; // ISO string
  check_out_date: string;   // ISO string

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
  organization_id: number;
  property_id: number;
  customer_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  no_of_guests: number;
  price_elements?: any;
  guest_data?: any;
  additional_requests?: any;
}

// For status updates
export interface BookingStatusUpdateDTO {
  status: ReservationStatusEnum;
}
