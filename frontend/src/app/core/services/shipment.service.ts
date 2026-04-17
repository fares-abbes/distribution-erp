import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { Shipment, ShipmentStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private http = inject(HttpClient);
  private base = `${API_URL}/shipments`;

  getAll() { return this.http.get<Shipment[]>(this.base); }
  getMyShipments() { return this.http.get<Shipment[]>(`${this.base}/my-shipments`); }
  getById(id: number) { return this.http.get<Shipment>(`${this.base}/${id}`); }
  getByTracking(trackingNumber: string) { return this.http.get<Shipment>(`${this.base}/tracking/${trackingNumber}`); }
  getByRider(riderId: number) { return this.http.get<Shipment[]>(`${this.base}/rider/${riderId}`); }
  updateStatus(id: number, status: ShipmentStatus, statusDescription?: string) {
    return this.http.patch<Shipment>(`${this.base}/${id}/status`, { status, statusDescription });
  }
  assignRider(id: number, riderId: number) {
    return this.http.patch<Shipment>(`${this.base}/${id}/assign-rider`, { riderId });
  }
}
