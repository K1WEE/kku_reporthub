import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supabase } from '../../shared/services/supabase';
import { Session } from 'inspector/promises';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(Supabase);

  await supabase.getSession();

  if (supabase._session) {
    return true;
  }else {
    console.log("test");
    router.navigate(['login']);
    return false;
  }
};
