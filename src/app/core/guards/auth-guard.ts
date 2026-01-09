import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // We use toObservable because the 'initialized' signal tells us
  // when Supabase has finished checking the LocalStorage session.
  return toObservable(supabase.initialized).pipe(
    filter(initialized => initialized === true), // Wait for init
    take(1),                                     // Only take the first true value
    map(() => {
      if (supabase.user()) {
        return true; // User is logged in
      } else {
        // Redirect to login, passing the attempted URL for a return-redirect
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
      }
    })
  );
};
