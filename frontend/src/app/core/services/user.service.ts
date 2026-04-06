import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${API_URL}/users`;

  getAll() { return this.http.get<User[]>(this.base); }
  getById(id: number) { return this.http.get<User>(`${this.base}/${id}`); }
  create(dto: any) { return this.http.post<User>(this.base, dto); }
  update(id: number, dto: any) { return this.http.put<User>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
