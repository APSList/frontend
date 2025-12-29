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

// ✅ runtime lists (za PrimeNG options)
export const AMENITY_TYPE_VALUES = ['Pool', 'Kitchen', 'Gym', 'Parking', 'Wifi'] as const;
export const PROPERTY_STATUS_VALUES = ['Available', 'SoldOut', 'Closed'] as const;
export const PROPERTY_TYPE_VALUES = [
  'Apartment',
  'House',
  'Villa',
  'Studio',
  'Room',
  'Cottage',
  'Bungalow',
  'Chalet',
  'Duplex',
  'Penthouse',
  'Townhouse',
  'Farmhouse',
  'Loft',
  'MobileHome'
] as const;

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
 * ✅ Enoten DTO za CREATE + UPDATE
 * - images = nove slike (File[])
 * - existingImagePaths = obdrži te slike (backend jih po delete-u ponovno doda)
 */
export interface PropertyUpsertRequestDTO {
  name: string;
  description?: string | null;

  address?: string | null;
  country?: string | null;

  propertyType: PropertyTypeEnum;

  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;

  pricePerPersonDay?: number | null;
  dennyFee?: number | null;

  status: PropertyStatusEnum;

  amenities?: AmenityTypeEnum[] | null;

  // ✅ nov seznam slik
  existingImagePaths?: string[] | null; // storagePath-ji za “keep”
  images?: File[] | null;               // nove slike
}

// Če želiš ohraniti stara imena:
export type PropertyCreateRequestDTO = PropertyUpsertRequestDTO;
export type PropertyUpdateRequestDTO = PropertyUpsertRequestDTO;
