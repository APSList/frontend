import { PropertyFilterInput } from "../types/property.graphql.types";

export function buildPropertyWhere(filters: {
  name?: string | null;
  status?: string | null;
  country?: string | null;
}): PropertyFilterInput | null {
  const and: PropertyFilterInput[] = [];

  const name = filters.name?.trim();
  const country = filters.country?.trim();

  if (name) and.push({ name: { contains: name } });
  if (filters.status) and.push({ status: { eq: filters.status } });
  if (country) and.push({ country: { contains: country } });

  return and.length ? { and } : null;
}
