import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { User } from '../models';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);

  const userId  = localStorage.getItem('userId');
  const authReq = userId
    ? req.clone({ setHeaders: { Authorization: `Bearer ${userId}` } })
    : req;

  return next(authReq).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (!(event instanceof HttpResponse)) return;

      if (!req.url.includes('/users?email=')) return;

      const users = (event as HttpResponse<User[]>).body;
      if (!users || !Array.isArray(users) || users.length === 0) return;

      const user: User = users[0];

      localStorage.setItem('userId',      user.id.toString());
      localStorage.setItem('currentUser', JSON.stringify(user));

      authService.notifyLoginSuccess(user);
    })
  );
};
