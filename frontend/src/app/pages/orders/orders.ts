import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../shared/toast.service';
import { Order, Merchant, Client, Product, OrderStatus } from '../../core/models';
import { BadgeComponent } from '../../shared/badge';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BadgeComponent, DatePipe, DecimalPipe],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit {
  private svc = inject(OrderService);
  private merchantSvc = inject(MerchantService);
  private clientSvc = inject(ClientService);
  private productSvc = inject(ProductService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  items = signal<Order[]>([]);
  merchants = signal<Merchant[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showStatusModal = signal(false);
  statusTarget = signal<number | null>(null);
  statuses: OrderStatus[] = ['DRAFT','CONFIRMED','CANCELLED'];

  form = this.fb.group({
    clientId: [null as number | null, Validators.required],
    merchantId: [null as number | null, Validators.required],
    paymentMethod: ['PREPAID', Validators.required],
    codAmount: [null as number | null],
    items: this.fb.array([this.newItem()]),
  });

  statusForm = this.fb.group({ status: ['', Validators.required] });

  get itemsArray() { return this.form.get('items') as FormArray; }

  newItem() {
    return this.fb.group({
      productId: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [null as number | null],
      discount: [0],
    });
  }

  ngOnInit() {
    this.load();
    this.merchantSvc.getAll().subscribe(d => this.merchants.set(d));
    this.clientSvc.getAll().subscribe(d => this.clients.set(d));
    this.productSvc.getAll().subscribe(d => this.products.set(d));
  }

  load() {
    this.loading.set(true);
    const obs = (this.auth.hasRole('ADMIN') || this.auth.hasRole('MANAGER'))
      ? this.svc.getAll()
      : this.svc.getByMerchant(0);
    obs.subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openCreate() { this.form.reset({ paymentMethod: 'PREPAID' }); while (this.itemsArray.length) this.itemsArray.removeAt(0); this.itemsArray.push(this.newItem()); this.showModal.set(true); }
  addItem() { this.itemsArray.push(this.newItem()); }
  removeItem(i: number) { if (this.itemsArray.length > 1) this.itemsArray.removeAt(i); }
  close() { this.showModal.set(false); }

  onProductChange(i: number) {
    const pid = this.itemsArray.at(i).get('productId')?.value;
    const p = this.products().find(x => x.id == pid);
    if (p) this.itemsArray.at(i).patchValue({ unitPrice: p.salePrice });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.place(this.form.value).subscribe({ next: () => { this.toast.success('Order placed'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  openStatus(id: number) { this.statusTarget.set(id); this.statusForm.reset(); this.showStatusModal.set(true); }
  closeStatus() { this.showStatusModal.set(false); }
  saveStatus() {
    if (this.statusForm.invalid) return;
    this.svc.updateStatus(this.statusTarget()!, this.statusForm.value.status as OrderStatus)
      .subscribe({ next: () => { this.toast.success('Status updated'); this.closeStatus(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  productName(id?: number) { return this.products().find(p => p.id === id)?.name ?? ''; }
  clientName(id?: number) { return this.clients().find(c => c.id === id)?.fullName ?? id ?? '-'; }
  merchantName(id?: number) { return this.merchants().find(m => m.id === id)?.storeName ?? id ?? '-'; }

  err(name: string) {
    const c = this.form.get(name);
    return c?.touched && c?.invalid;
  }
}
