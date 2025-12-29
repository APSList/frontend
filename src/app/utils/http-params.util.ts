import { HttpParams } from '@angular/common/http';

export function toHttpParams(obj: Record<string, unknown>): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === '') continue;
        params = params.append(key, String(v));
      }
      continue;
    }

    params = params.set(key, String(value));
  }

  return params;
}
