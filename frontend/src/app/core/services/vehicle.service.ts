import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Vehicle } from '../models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private base = `${API_URL}/vehicles`;

  getAll() { return this.http.get<Vehicle[]>(this.base); }
  getById(id: number) { return this.http.get<Vehicle>(`${this.base}/${id}`); }
  create(dto: Partial<Vehicle>) { return this.http.post<Vehicle>(this.base, dto); }
  update(id: number, dto: Partial<Vehicle>) { return this.http.put<Vehicle>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
