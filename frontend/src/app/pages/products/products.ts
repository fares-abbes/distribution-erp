import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { MerchantService } from '../../core/services/merchant.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../shared/toast.service';
import { Product, Merchant } from '../../core/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
  private svc = inject(ProductService);
  private merchantSvc = inject(MerchantService);
  private invSvc = inject(InventoryService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Product[]>([]);
  merchants = signal<Merchant[]>([]);
  stockTotals = signal<Record<number, number>>({});
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    sku: ['', Validators.required],
    barcode: [''],
    name: ['', Validators.required],
    description: [''],
    type: [''],
    purchasePrice: [0],
    salePrice: [0],
    weight: [0],
    minStockLevel: [0],
    merchantId: [null as number | null],
    isFragile: [false],
    imageUrl: [''],
  });

  ngOnInit() {
    this.load();
    this.merchantSvc.getAll().subscribe(d => this.merchants.set(d));
    this.invSvc.getAllTotals().subscribe(d => this.stockTotals.set(d));
  }
  load() { this.loading.set(true); this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  totalStock(productId: number) { return this.stockTotals()[productId] ?? 0; }
  openCreate() { this.editingId.set(null); this.form.reset({ purchasePrice: 0, salePrice: 0, weight: 0, minStockLevel: 0, isFragile: false }); this.showModal.set(true); }
  openEdit(item: Product) { this.editingId.set(item.id); this.form.patchValue({ ...item, isFragile: item.fragile }); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId() ? this.svc.update(this.editingId()!, this.form.value) : this.svc.create(this.form.value);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  delete(id: number) {
    if (!confirm('Delete this product?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }
  merchantName(id?: number) { return this.merchants().find(m => m.id === id)?.storeName ?? '-'; }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
  onImgError(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }
}
