import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Order, OrderStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${API_URL}/orders`;

  getAll() { return this.http.get<Order[]>(this.base); }
  getById(id: number) { return this.http.get<Order>(`${this.base}/${id}`); }
  getByMerchant(merchantId: number) { return this.http.get<Order[]>(`${this.base}/merchant/${merchantId}`); }
  getByClient(clientId: number) { return this.http.get<Order[]>(`${this.base}/client/${clientId}`); }
  place(dto: any) { return this.http.post<Order>(this.base, dto); }
  updateStatus(id: number, status: OrderStatus) { return this.http.patch<Order>(`${this.base}/${id}/status`, { status }); }
}
