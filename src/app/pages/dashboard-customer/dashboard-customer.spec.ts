import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCustomer } from './dashboard-customer';

describe('DashboardCustomer', () => {
  let component: DashboardCustomer;
  let fixture: ComponentFixture<DashboardCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
