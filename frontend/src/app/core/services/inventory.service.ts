import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { WarehouseInventory } from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private base = `${API_URL}/inventory`;

  getAllTotals() { return this.http.get<Record<number, number>>(`${this.base}/totals`); }
  getByProduct(productId: number) { return this.http.get<WarehouseInventory[]>(`${this.base}/product/${productId}`); }
  getTotalStock(productId: number) { return this.http.get<number>(`${this.base}/product/${productId}/total`); }
  getByWarehouse(warehouseId: number) { return this.http.get<WarehouseInventory[]>(`${this.base}/warehouse/${warehouseId}`); }
  setStock(dto: { productId: number; warehouseId: number; quantity: number }) {
    return this.http.post<WarehouseInventory>(`${this.base}/set`, dto);
  }
  adjustStock(dto: { productId: number; warehouseId: number; delta: number }) {
    return this.http.patch<WarehouseInventory>(`${this.base}/adjust`, dto);
  }
}
