import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { DashboardStats } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${API_URL}/dashboard`;

  getStats() {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }
}
