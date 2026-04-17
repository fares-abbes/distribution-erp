import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Warehouse } from '../models';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private http = inject(HttpClient);
  private base = `${API_URL}/warehouses`;

  getAll() { return this.http.get<Warehouse[]>(this.base); }
  getById(id: number) { return this.http.get<Warehouse>(`${this.base}/${id}`); }
  create(dto: any) { return this.http.post<Warehouse>(this.base, dto); }
  update(id: number, dto: any) { return this.http.put<Warehouse>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
