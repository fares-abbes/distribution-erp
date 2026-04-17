import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { WarehouseService } from '../../core/services/warehouse.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../shared/toast.service';
import { Warehouse, WarehouseInventory, Product } from '../../core/models';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
  templateUrl: './warehouses.html',
})
export class WarehousesComponent implements OnInit {
  private svc = inject(WarehouseService);
  private invSvc = inject(InventoryService);
  private productSvc = inject(ProductService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Warehouse[]>([]);
  products = signal<Product[]>([]);
  loading = signal(false);

  // Warehouse create/edit modal
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    name:    ['', Validators.required],
    city:    ['', Validators.required],
    address: [''],
    active:  [true],
  });

  // Stock viewer + stock editor
  showStockModal = signal(false);
  selectedWarehouse = signal<Warehouse | null>(null);
  stockRows = signal<WarehouseInventory[]>([]);
  stockLoading = signal(false);
  stockSaving = signal(false);

  stockForm = this.fb.group({
    productId: [null as number | null, Validators.required],
    quantity:  [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.load();
    this.productSvc.getAll().subscribe(d => this.products.set(d));
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.items.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Warehouse CRUD ──────────────────────────────────────────────────────────

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ active: true });
    this.showModal.set(true);
  }

  openEdit(item: Warehouse) {
    this.editingId.set(item.id);
    this.form.patchValue(item);
    this.showModal.set(true);
  }

  close() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, this.form.value)
      : this.svc.create(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Saved'); this.close(); this.load(); },
      error: (e) => this.toast.error(e?.error?.message ?? 'Error'),
    });
  }

  delete(id: number) {
    if (!confirm('Delete this warehouse?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.toast.success('Deleted'); this.load(); },
      error: () => this.toast.error('Error'),
    });
  }

  // ── Stock management ────────────────────────────────────────────────────────

  viewStock(warehouse: Warehouse) {
    this.selectedWarehouse.set(warehouse);
    this.stockForm.reset({ quantity: 0 });
    this.reloadStock(warehouse.id);
    this.showStockModal.set(true);
  }

  reloadStock(warehouseId: number) {
    this.stockLoading.set(true);
    this.invSvc.getByWarehouse(warehouseId).subscribe({
      next: d => { this.stockRows.set(d); this.stockLoading.set(false); },
      error: () => this.stockLoading.set(false),
    });
  }

  setStock() {
    if (this.stockForm.invalid) { this.stockForm.markAllAsTouched(); return; }
    const warehouse = this.selectedWarehouse();
    if (!warehouse) return;
    const { productId, quantity } = this.stockForm.value;
    this.stockSaving.set(true);
    this.invSvc.setStock({ productId: productId!, warehouseId: warehouse.id, quantity: quantity! }).subscribe({
      next: () => {
        this.toast.success('Stock updated');
        this.stockForm.reset({ quantity: 0 });
        this.reloadStock(warehouse.id);
        this.stockSaving.set(false);
      },
      error: (e) => { this.toast.error(e?.error?.message ?? 'Error'); this.stockSaving.set(false); },
    });
  }

  closeStock() { this.showStockModal.set(false); }

  productName(id: number) { return this.products().find(p => p.id === id)?.name ?? `#${id}`; }

  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
  stockErr(f: string) { const c = this.stockForm.get(f); return c?.invalid && c?.touched; }
}
