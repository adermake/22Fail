import { HttpInterceptorFn } from '@angular/common/http';
import { identityHeaders } from './identity';

/**
 * Attaches the signed-in user's identity (`x-user-id` / `x-user-code`) to every API request, so
 * the backend can resolve who is calling (soft auth). No-op when signed out.
 */
export const identityInterceptor: HttpInterceptorFn = (req, next) => {
  const headers = identityHeaders();
  if (!headers['x-user-id']) return next(req);
  return next(req.clone({ setHeaders: headers }));
};
