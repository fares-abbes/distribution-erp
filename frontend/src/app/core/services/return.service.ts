import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { ReturnOrder } from '../models';

@Injectable({ providedIn: 'root' })
export class ReturnService {
  private http = inject(HttpClient);
  private base = `${API_URL}/returns`;

  getById(id: number) { return this.http.get<ReturnOrder>(`${this.base}/${id}`); }
  getByMerchant(merchantId: number) { return this.http.get<ReturnOrder[]>(`${this.base}/merchant/${merchantId}`); }
  create(dto: any) { return this.http.post<ReturnOrder>(this.base, dto); }
}
