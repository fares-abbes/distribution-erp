import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Invoice, InvoiceStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private base = `${API_URL}/invoices`;

  getById(id: number) { return this.http.get<Invoice>(`${this.base}/${id}`); }
  getByMerchant(merchantId: number) { return this.http.get<Invoice[]>(`${this.base}/merchant/${merchantId}`); }
  generate(dto: any) { return this.http.post<Invoice>(`${this.base}/generate`, dto); }
  updateStatus(id: number, status: InvoiceStatus) {
    return this.http.patch<Invoice>(`${this.base}/${id}/status`, null, { params: { status } });
  }
}
