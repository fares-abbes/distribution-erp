import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Product } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${API_URL}/products`;

  getAll() { return this.http.get<Product[]>(this.base); }
  getById(id: number) { return this.http.get<Product>(`${this.base}/${id}`); }
  getByMerchant(merchantId: number) { return this.http.get<Product[]>(`${this.base}/merchant/${merchantId}`); }
  create(dto: any) { return this.http.post<Product>(this.base, dto); }
  update(id: number, dto: any) { return this.http.put<Product>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
