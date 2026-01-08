import { Component, signal, inject, OnInit } from '@angular/core';
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

  booking = signal<Reservation | null>(null);
  loading = signal(true);
  saving = signal(false);
  minCheckOutDate: Date = new Date();
  today: Date = new Date();

  // New / edit signals
  isNew = signal(false);
  editMode = signal(false);

  customerOptions: { label: string, value: string | number }[] = [];
  showCustomerDialog = false;
  newCustomer = { fullName: '', email: '' };
  creatingCustomer = false;

  // Form
  form: FormGroup;

  propertyOptions: { label: string, value: string | number }[] = [];
  loadingProperties = false;

  readonly bookingStatusOptions = [
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Payment Required', value: 'PAYMENT_REQUIRED' },
    { label: 'Created', value: 'CREATED' },
    { label: 'Cancelled', value: 'CANCELLED' }

  ];

  constructor() {
    // Init empty form
    this.form = this.fb.group({
      propertyId: [null, Validators.required],
      customerId: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['PENDING', Validators.required],
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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || idParam === 'new') {
      this.isNew.set(true);
      this.editMode.set(true);
      this.loading.set(false);
      return; // New booking, form remains empty
    }

    const id = Number(idParam);
    if (!Number.isFinite(id)) return;

    this.bookingRest.getById(id).subscribe({
      next: (res) => {
        this.booking.set(res);
        this.form.patchValue({
          propertyId: res.propertyId,
          customerId: res.customerId,
          startDate: res.startDate,
          endDate: res.endDate,
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

    this.loadPropertyNames();
    this.loadCustomers();
  }

  loadPropertyNames() {
    this.loadingProperties = true;
    this.propertyService.getGridProperties().subscribe({
      next: (properties: any[]) => {
        this.propertyOptions = properties.map(p => ({
          label: p.name,   // The text shown to user
          value: p.id      // The ID stored in the form
        }));
        this.loadingProperties = false;
      },
      error: () => {
        this.loadingProperties = false;
      }
    });
  }

  loadCustomers() {
    this.bookingRest.getAllCustomers().subscribe(customers => {
      this.customerOptions = customers.map(c => ({
        label: c.fullName,
        value: c.id
      }));
    });
  }

  openNewCustomerDialog() {
    this.newCustomer = { fullName: '', email: '' };
    this.showCustomerDialog = true;
  }

  saveCustomer() {
    if (!this.newCustomer.fullName || !this.newCustomer.email) return;

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

  toggleEdit() {
    this.editMode.set(!this.editMode());
    if (this.editMode()) this.form.enable();
    else this.form.disable();
  }

  async save(): Promise<void> {
    if (!this.form) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const dto: ReservationRequest = this.form.getRawValue();

      let saved: Reservation;

      if (this.isNew()) {
        // create a new booking
        saved = await firstValueFrom(this.bookingRest.create(dto));
        // set the returned booking to the signal
        this.booking.set(saved);
        this.isNew.set(false);
      } else {
        // update existing booking
        const id = this.booking()?.id;
        if (!id) throw new Error("Booking ID missing for update");
        saved = await firstValueFrom(this.bookingRest.update(id, dto));
        this.booking.set(saved);
      }

      // Refresh form values after save
      this.form.patchValue({
        ...saved,
        updatedAt: saved.updatedAt,
      });

      this.form.disable();
      this.editMode.set(false);

    } finally {
      this.saving.set(false);
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
