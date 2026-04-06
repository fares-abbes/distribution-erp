import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Payment } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${API_URL}/payments`;

  getByMerchant(merchantId: number) { return this.http.get<Payment[]>(`${this.base}/merchant/${merchantId}`); }
  getById(id: number) { return this.http.get<Payment>(`${this.base}/${id}`); }
  create(dto: any) { return this.http.post<Payment>(this.base, dto); }
  updateStatus(id: number, dto: any) { return this.http.patch<Payment>(`${this.base}/${id}/status`, dto); }
}
