import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Rider } from '../models';

@Injectable({ providedIn: 'root' })
export class RiderService {
  private http = inject(HttpClient);
  private base = `${API_URL}/riders`;

  getAll() { return this.http.get<Rider[]>(this.base); }
  getById(id: number) { return this.http.get<Rider>(`${this.base}/${id}`); }
  create(dto: Partial<Rider>) { return this.http.post<Rider>(this.base, dto); }
  update(id: number, dto: Partial<Rider>) { return this.http.put<Rider>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
