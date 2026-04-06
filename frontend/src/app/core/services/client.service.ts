import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Client } from '../models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private base = `${API_URL}/clients`;

  getAll() { return this.http.get<Client[]>(this.base); }
  getById(id: number) { return this.http.get<Client>(`${this.base}/${id}`); }
  getByMerchant(merchantId: number) { return this.http.get<Client[]>(`${this.base}/merchant/${merchantId}`); }
  create(dto: Partial<Client>) { return this.http.post<Client>(this.base, dto); }
  update(id: number, dto: Partial<Client>) { return this.http.put<Client>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
