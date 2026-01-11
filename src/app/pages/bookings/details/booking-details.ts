import {Component, signal, inject, OnInit, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PropertyGraphqlService } from '../../../services/property-graphql.service';
import { Property } from '../../../types/property.types';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';

import { BookingRestService } from '../../../services/booking-rest.service';
import type {Reservation, ReservationRequest, ReservationStatusEnum} from '../../../types/booking.types';
import {SelectModule} from "primeng/select";
import {PropertyImageUploader} from "../../../components/property-image-uploader/property-image-uploader";
import {DialogModule} from "primeng/dialog";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {SupabaseService} from "../../../services/supabase.service";

@Component({
  standalone: true,
  selector: 'booking-details',
  templateUrl: './booking-detail.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    TagModule,
    DatePipe,
    CurrencyPipe,
    SelectModule,
    DatePickerModule,
    DialogModule,
    FormsModule
  ]
})
export class BookingDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingRest = inject(BookingRestService);
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyGraphqlService);
  private cd : ChangeDetectorRef = inject(ChangeDetectorRef);
  private supabase = inject(SupabaseService);

  booking = signal<Reservation | null>(null);
  loading = signal(true);
  saving = signal(false);
  minCheckOutDate: Date = new Date();
  minCheckInDate: Date = new Date();
  today: Date = new Date();

  disabledDates = signal<Date[]>([]);
  allReservationsForProperty: Reservation[] = [];

  // New / edit signals
  isNew = signal(false);
  editMode = signal(false);

  customerOptions: { label: string, value: string | number }[] = [];
  showCustomerDialog = false;
  newCustomer = { full_name: '', email: '' };
  creatingCustomer = false;

  // Form
  form: FormGroup;

  propertyOptions: { label: string, value: string | number, price: number | null}[] = [];
  loadingProperties = false;

  readonly bookingStatusOptions = [
    { label: 'CONFIRMED', value: 'CONFIRMED' },
    { label: 'PAYMENT_REQUIRED', value: 'PAYMENT_REQUIRED' },
    { label: 'CREATED', value: 'CREATED' },
    { label: 'CANCELLED', value: 'CANCELLED' }
  ];

  constructor() {
    // Init empty form
    this.form = this.fb.group({
      propertyId: [null, Validators.required],
      customerId: [null, Validators.required],
      check_in_date: [null, Validators.required],
      check_out_date: [null, Validators.required],
      status: ['CREATED', Validators.required],
      totalPrice: [0, Validators.required],
      noOfGuests: [1, [Validators.required, Validators.min(1)]],
      priceElements: [{}],
      guestData: [{}],
      additionalRequests: [{}],
      paymentUrl: [''],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.loadPropertyNames();
    this.loadCustomers();

    setTimeout(() => {
      console.log("Forcing a refresh");
    }, 2000);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || idParam === 'new') {
      this.isNew.set(true);
      this.editMode.set(true);
      this.loading.set(false);
      return; // New booking, form remains empty
    }

    const id = Number(idParam);
    if (!Number.isFinite(id)) return;

    this.form.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });

    this.form.get('propertyId')?.valueChanges.subscribe(propertyId => {
      if (propertyId) {
        this.fetchReservedDates(propertyId);

        // Update price helper
        const selected = this.propertyOptions.find(p => p.value === propertyId);
        if (selected?.price) {
          this.form.patchValue({ pricePerPersonDay: selected.price });
        }
      }
    });

    // Specifically watch propertyId to fetch its price
    this.form.get('propertyId')?.valueChanges.subscribe(id => {
      const selected = this.propertyOptions.find(p => p.value === id);
      if (selected?.price) {
        // Updating this will trigger the valueChanges listener above
        this.form.patchValue({ pricePerPersonDay: selected.price });
      }
    });

    this.form.valueChanges.pipe(
      debounceTime(100), // Wait for user to stop typing/clicking
      distinctUntilChanged((prev, curr) =>
        prev.check_in_date === curr.check_in_date &&
        prev.check_out_date === curr.check_out_date &&
        prev.noOfGuests === curr.noOfGuests &&
        prev.pricePerPersonDay === curr.pricePerPersonDay
      )
    ).subscribe(() => {
      this.calculateTotalPrice();
    });

    this.bookingRest.getById(id).subscribe({
      next: (res) => {
        this.booking.set(res);
        this.form.patchValue({
          propertyId: res.propertyId,
          customerId: res.customerId,
          check_in_date: res.check_in_date ? new Date(res.check_in_date) : null,
          check_out_date: res.check_out_date ? new Date(res.check_out_date) : null,
          status: res.status,
          totalPrice: res.totalPrice,
          noOfGuests: res.noOfGuests,
          priceElements: res.priceElements ?? {},
          guestData: res.guestData ?? {},
          additionalRequests: res.additionalRequests ?? {},
          paymentUrl: res.paymentUrl ?? '',
          createdAt: res.createdAt,
          updatedAt: res.updatedAt
        });
        this.form.disable();
        this.editMode.set(false);

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  fetchReservedDates(propertyId: number) {
    // Assuming your bookingRest has a method to get bookings by property
    // If not, you may need to filter a 'getAll' call or add a specific endpoint
    this.bookingRest.getAll().subscribe(allBookings => {
      const currentBookingId = this.booking()?.id;

      // 1. Filter bookings for this property (exclude the one we are currently editing)
      const otherBookings = allBookings.filter(b =>
        b.propertyId === propertyId &&
        b.id !== currentBookingId &&
        b.status !== 'CANCELLED'
      );

      // 2. Generate Date objects for every day between check-in and check-out
      const datesToBlock: Date[] = [];

      otherBookings.forEach(res => {
        const start = new Date(res.check_in_date);
        const end = new Date(res.check_out_date);

        let current = new Date(start);
        while (current <= end) {
          datesToBlock.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });

      this.disabledDates.set(datesToBlock);
    });
  }

  loadPropertyNames() {
    this.loadingProperties = true;
    this.propertyService.getGridProperties().subscribe({
      next: (properties: any[]) => {
        this.propertyOptions = properties.map(p => ({
          label: p.name,   // The text shown to user
          value: p.id,     // The ID stored in the form
          price: p.pricePerPersonDay
        }));
        this.loadingProperties = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loadingProperties = false;
      }
    });
  }

  loadCustomers() {
    this.bookingRest.getAllCustomers().subscribe(customers => {
      this.customerOptions = customers.map(c => ({
        label: c.full_name,
        value: c.id
      }));
    });
  }

  openNewCustomerDialog() {
    this.newCustomer = { full_name: '', email: '' };
    this.showCustomerDialog = true;
  }

  saveCustomer() {
    if (!this.newCustomer.full_name || !this.newCustomer.email) return;

    this.creatingCustomer = true;
    this.bookingRest.createCustomer(this.newCustomer).subscribe({
      next: (res) => {
        // Add new customer to list and select them
        this.customerOptions = [...this.customerOptions, { label: res.fullName, value: res.id }];
        this.form.patchValue({ customerId: res.id });

        this.showCustomerDialog = false;
        this.creatingCustomer = false;
      },
      error: () => this.creatingCustomer = false
    });
  }

  back() {
    this.router.navigate(['/bookings']);
  }

  calculateTotalPrice() {
    const { check_in_date, check_out_date, noOfGuests, pricePerPersonDay } = this.form.getRawValue();

    if (check_in_date && check_out_date && noOfGuests && pricePerPersonDay) {
      const start = new Date(check_in_date);
      const end = new Date(check_out_date);

      // Calculate difference in days
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        const total = diffDays * noOfGuests * pricePerPersonDay;
        // EmitEvent: false prevents the valueChanges listener from entering an infinite loop
        this.form.patchValue({ totalPrice: total }, { emitEvent: false });
      }
    }
  }

  toggleEdit() {
    this.editMode.set(!this.editMode());
    if (this.editMode()) this.form.enable();
    else this.form.disable();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentOrgId = this.supabase.user()?.user_metadata['organization_id'];

    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();

      const addTwoHours = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setHours(d.getHours() + 2); // Tukaj prištejemo 2 uri
        return d.toISOString();
      };

      // Map form values to the ReservationRequest interface
      const dto: any = { // Use 'any' temporarily if you haven't updated the interface yet
        organization_id: currentOrgId,
        property_id: Number(raw.propertyId),
        customer_id: Number(raw.customerId),
        check_in_date: raw.check_in_date ? addTwoHours(new Date(raw.check_in_date).toISOString()) : '',
        check_out_date: raw.check_out_date ? addTwoHours(new Date(raw.check_out_date).toISOString()) : '',
        total_price: raw.totalPrice || 0,
        status: raw.status,
        no_of_guests: raw.noOfGuests || 1,
        price_elements: raw.priceElements ?? {},
        guest_data: raw.guestData ?? {},
        additional_requests: raw.additionalRequests ?? {}
      };
      let saved: Reservation;

      if (this.isNew()) {
        saved = await firstValueFrom(this.bookingRest.create(dto));
        this.booking.set(saved);
        this.isNew.set(false);
      } else {
        const id = this.booking()?.id;
        if (!id) throw new Error("Booking ID missing for update");
        saved = await firstValueFrom(this.bookingRest.update(id, dto));
        this.booking.set(saved);
      }

      // Patch back values from server (like updated timestamps)
      this.form.patchValue(saved);
      this.form.disable();
      this.editMode.set(false);

    } catch (error) {
      console.error('Save failed:', error);
      // You could add a Toast service message here
    } finally {
      this.saving.set(false);
      this.cd.detectChanges();
    }
  }

  statusSeverity(status: ReservationStatusEnum | undefined) {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'PAYMENT_REQUIRED': return 'warn';
      default: return 'info';
    }
  }

  updateCheckOutLimit(selectedInDate: Date) {
    if (selectedInDate) {
      const nextDay = new Date(selectedInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      this.minCheckOutDate = nextDay;

      // Reset Check Out if it's now earlier than the new minimum
      const currentOut = this.form.get('checkOutDate')?.value;
      if (currentOut && currentOut <= selectedInDate) {
        this.form.patchValue({ checkOutDate: null });
      }
    }
  }
}
