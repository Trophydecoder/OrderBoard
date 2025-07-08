import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { SafehelperService } from './safehelper.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  api = environment.apiUrl;

  constructor(
    private http: HttpClient, private safeHelper: SafehelperService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  

  register(data: any) {
    return this.http.post(`${this.api}/RegisterUser`, data);
  }

  login(data: any) {
    return this.http.post(`${this.api}/LoginUser`, data);
  }

  getProfile(): Observable<any> {
    if (isPlatformBrowser(this.platformId)) {
      const token =  this.safeHelper.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.api}/user/profile`, { headers });
    } else {
      return of({ totalOrders: 0 });
    }
  }


  //password resetting post your email to send eset details
  requestPasswordReset(email: string) {
    return this.http.post(`${this.api}/request-password-reset`, { email });
  }


  resetPassword(newPassword: string, token: string) {
    return this.http.post(
      `${this.api}/reset-password/${token}`,
      { newPassword } // Send as newPassword to match backend
    );
  }

  //reset while logged in
  resetPasswordLoggedIn(newPassword: string): Observable<any> {
    const token =  this.safeHelper.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.api}/reset-password-logged-in`, { newPassword }, { headers });
  }

  



  //frequent customers
  getFrequentCustomers() {
    const token =  this.safeHelper.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.api}/frequent-customers`, { headers });
  }

  

  //creating order
  createOrder(orderData: any) {
    const token =  this.safeHelper.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.api}/create-order`, orderData, { headers });
  }



    // Fetch orders for logged-in user
  getOrders(): Observable<any[]> {
    const token = this.safeHelper.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.api}/order-history`, { headers });
  }



  //settings
  updateProfile(data: { username: string; email: string }): Observable<any> {
    const token = this.safeHelper.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.put(`${this.api}/auth/update`, data, { headers });
  }

}