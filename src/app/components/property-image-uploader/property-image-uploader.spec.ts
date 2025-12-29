import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyImageUploader } from './property-image-uploader';

describe('PropertyImageUploader', () => {
  let component: PropertyImageUploader;
  let fixture: ComponentFixture<PropertyImageUploader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyImageUploader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyImageUploader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
