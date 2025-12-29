// property.graphql.types.ts

export type SortDirection = 'ASC' | 'DESC';

// ---- Operation filterji (po shemi) ----

export type StringOperationFilterInput = {
  eq?: string | null;
  neq?: string | null;
  contains?: string | null;
  ncontains?: string | null;
  startsWith?: string | null;
  nstartsWith?: string | null;
  endsWith?: string | null;
  nendsWith?: string | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
};

export type IntOperationFilterInput = {
  eq?: number | null;
  neq?: number | null;
  gt?: number | null;
  gte?: number | null;
  lt?: number | null;
  lte?: number | null;
  in?: (number | null)[] | null;
  nin?: (number | null)[] | null;
};

export type DateTimeOperationFilterInput = {
  eq?: string | null;   // ISO string
  neq?: string | null;
  gt?: string | null;
  gte?: string | null;
  lt?: string | null;
  lte?: string | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
};

// Decimal v HotChocolate je običajno string v GraphQL JSON (da ne izgubi natančnosti).
// Lahko uporabljaš tudi number, ampak priporočam string | number.
export type DecimalOperationFilterInput = {
  eq?: string | number | null;
  neq?: string | number | null;
  gt?: string | number | null;
  gte?: string | number | null;
  lt?: string | number | null;
  lte?: string | number | null;
  in?: (string | number | null)[] | null;
  nin?: (string | number | null)[] | null;
};

// ---- Enumi ----
export type PropertyStatusEnum = string;

// HotChocolate je generiral poseben input za enum:
export type PropertyStatusEnumOperationFilterInput = {
  eq?: PropertyStatusEnum | null;
  neq?: PropertyStatusEnum | null;
  in?: (PropertyStatusEnum | null)[] | null;
  nin?: (PropertyStatusEnum | null)[] | null;
};

// ---- Nested list filterji (iz sheme) ----
// Imena so dolga, ampak točno taka so v shemi: ListFilterInputTypeOfXFilterInput
// Najbolj praktično je modelirat generično obliko, ki jo HC tipično uporablja.

export type ListFilterInput<TFilter> = {
  all?: TFilter | null;
  none?: TFilter | null;
  some?: TFilter | null;
  any?: boolean | null;
};

export type PropertyAmenityFilterInput = {
  and?: PropertyAmenityFilterInput[] | null;
  or?: PropertyAmenityFilterInput[] | null;

  propertyId?: IntOperationFilterInput | null;
  amenityName?: StringOperationFilterInput | null; // če je enum, bo tu drugačen input v shemi
};

export type ListFilterInputTypeOfPropertyAmenityFilterInput =
  ListFilterInput<PropertyAmenityFilterInput>;

// ✅ Glavni tip iz sheme:
export type PropertyFilterInput = {
  and?: PropertyFilterInput[] | null;
  or?: PropertyFilterInput[] | null;

  id?: IntOperationFilterInput | null;
  organizationId?: IntOperationFilterInput | null;

  name?: StringOperationFilterInput | null;
  description?: StringOperationFilterInput | null;
  address?: StringOperationFilterInput | null;
  country?: StringOperationFilterInput | null;

  propertyType?: StringOperationFilterInput | null;

  maxGuests?: IntOperationFilterInput | null;
  bedrooms?: IntOperationFilterInput | null;
  bathrooms?: IntOperationFilterInput | null;

  status?: PropertyStatusEnumOperationFilterInput | null;

  dennyFee?: DecimalOperationFilterInput | null;
  pricePerPersonDay?: DecimalOperationFilterInput | null;

  propertyAmenities?: ListFilterInputTypeOfPropertyAmenityFilterInput | null;
};

// Sort input še nisi izpisal – ampak če je standard, bo podobno kot prej.
// Če želiš, naredi isti introspection za PropertySortInput in ti ga napišem 1:1.
export type PropertySortInput = {
  id?: SortDirection;
  name?: SortDirection;
  country?: SortDirection;
  status?: SortDirection;
  propertyType?: SortDirection;
  maxGuests?: SortDirection;
  bedrooms?: SortDirection;
  bathrooms?: SortDirection;
  dennyFee?: SortDirection;
  pricePerPersonDay?: SortDirection;
  createdAt?: SortDirection;
  updatedAt?: SortDirection;
};
