// property-graphql.service.ts
import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError,
} from '@apollo/client/errors';

import type { PropertyFilterInput, PropertySortInput } from '../types/property.graphql.types';
import type { Property } from '../types/property.types';

export const PROPERTIES_GRID_QUERY = gql`
  query Properties($where: PropertyFilterInput, $order: [PropertySortInput!]) {
    properties(where: $where, order: $order) {
      id
      name
      propertyType
      country
      address
      maxGuests
      bedrooms
      bathrooms
      pricePerPersonDay
      dennyFee
      status
      updatedAt
      updatedBy
    }
  }
`;

function logApolloError(error: unknown): void {
  if (!error) return;

  if (CombinedGraphQLErrors.is(error)) {
    console.error('GraphQL errors (combined):', error.errors);
    return;
  }
  if (CombinedProtocolErrors.is(error)) {
    console.error('Protocol errors:', error.errors);
    return;
  }
  if (LocalStateError.is(error)) {
    console.error('Local state error:', error);
    return;
  }
  if (ServerError.is(error)) {
    console.error('Server error:', {
      statusCode: error.statusCode,
      message: error.message,
      result: (error as any).result,
    });
    return;
  }
  if (ServerParseError.is(error)) {
    console.error('Server parse error:', {
      statusCode: error.statusCode,
      message: error.message,
      bodyText: error.bodyText,
    });
    return;
  }
  if (UnconventionalError.is(error)) {
    console.error('Unconventional error:', error);
    return;
  }
  if (error instanceof HttpErrorResponse) {
    console.error('HTTP error:', error.status, error.statusText, 'body:', error.error);
    return;
  }
  console.error('Unknown Apollo error:', error);
}

@Injectable({ providedIn: 'root' })
export class PropertyGraphqlService {
  private apollo = inject(Apollo);

  getGridProperties(
    where: PropertyFilterInput | null = null,
    order: PropertySortInput[] | null = null,
  ): Observable<Property[]> {
    return this.apollo
      .query<{ properties: Property[] }>({
        query: PROPERTIES_GRID_QUERY,
        variables: { where, order},
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      })
      .pipe(
        tap(res => {
          if (res.error) logApolloError(res.error);
        }),
        map(res => res.data?.properties ?? []),
        catchError(err => {
          logApolloError(err);
          return of([] as Property[]);
        })
      );
  }
}
