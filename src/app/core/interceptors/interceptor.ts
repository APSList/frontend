// src/app/interceptors/jwt.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService);

  // Use the new getter we created
  const token = supabase.accessToken;

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    // If this logs, it means you're trying to call the API before login is finished
    console.warn('HTTP Request skipped Auth Header: No session found.');
  }

  return next(req);
};
