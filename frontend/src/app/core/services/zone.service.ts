import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Zone } from '../models';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  private http = inject(HttpClient);
  private base = `${API_URL}/zones`;

  getAll() { return this.http.get<Zone[]>(this.base); }
  getById(id: number) { return this.http.get<Zone>(`${this.base}/${id}`); }
  create(dto: Partial<Zone>) { return this.http.post<Zone>(this.base, dto); }
  update(id: number, dto: Partial<Zone>) { return this.http.put<Zone>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
