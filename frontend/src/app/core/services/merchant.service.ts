import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Merchant } from '../models';

@Injectable({ providedIn: 'root' })
export class MerchantService {
  private http = inject(HttpClient);
  private base = `${API_URL}/merchants`;

  getAll() { return this.http.get<Merchant[]>(this.base); }
  getById(id: number) { return this.http.get<Merchant>(`${this.base}/${id}`); }
  create(dto: Partial<Merchant>) { return this.http.post<Merchant>(this.base, dto); }
  update(id: number, dto: Partial<Merchant>) { return this.http.put<Merchant>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
