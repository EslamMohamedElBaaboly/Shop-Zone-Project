import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = '';

  private currentUserSubject = new BehaviorSubject<User | null>(
    this._loadUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private _loadUserFromStorage(): User | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try { return JSON.parse(raw) as User; }
    catch { return null; }
  }

  notifyLoginSuccess(user: User): void {
    this.currentUserSubject.next(user);
  }

  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(
      `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>('/users', user);
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const userId = localStorage.getItem('userId');
    return !!userId && userId.trim() !== '';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }
}
