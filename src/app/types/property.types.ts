// property.types.ts

export type AmenityTypeEnum =
  | 'Pool'
  | 'Kitchen'
  | 'Gym'
  | 'Parking'
  | 'Wifi';

export type PropertyStatusEnum =
  | 'Available'
  | 'SoldOut'
  | 'Closed';

export type PropertyTypeEnum =
  | 'Apartment'
  | 'House'
  | 'Villa'
  | 'Studio'
  | 'Room'
  | 'Cottage'
  | 'Bungalow'
  | 'Chalet'
  | 'Duplex'
  | 'Penthouse'
  | 'Townhouse'
  | 'Farmhouse'
  | 'Loft'
  | 'MobileHome';

export interface PropertyImage {
  id: number;
  propertyId: number;
  storagePath: string;
}

export interface PropertyAmenity {
  propertyId: number;
  amenityName: AmenityTypeEnum;
}

export interface Property {
  id: number;
  organizationId: number;

  name: string;
  description?: string | null;

  address?: string | null;
  country?: string | null;

  propertyType?: PropertyTypeEnum | null;

  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;

  status: PropertyStatusEnum;

  dennyFee?: number | null;
  pricePerPersonDay?: number | null;

  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;

  images?: PropertyImage[] | null;
  propertyAmenities?: PropertyAmenity[] | null;
}

/**
 * ✅ FE-friendly DTO (camelCase)
 * Če backend pričakuje PascalCase, naredi mapiranje v REST servisu pred pošiljanjem.
 */
export interface PropertyCreateRequestDTO {
  name: string;
  description?: string | null;

  // POZOR: backend ima "Adress" typo (če ga res zahteva), mapiraj v servisu.
  address?: string | null;

  country?: string | null;

  propertyType: PropertyTypeEnum;

  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;

  pricePerPersonDay?: number | null;
  dennyFee?: number | null;

  status: PropertyStatusEnum;

  images?: File[] | null;
  amenities?: AmenityTypeEnum[] | null;
}

export type PropertyUpdateRequestDTO = Omit<PropertyCreateRequestDTO, 'images'>;
