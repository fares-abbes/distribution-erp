import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ToastService } from '../../shared/toast.service';
import { Client, Merchant } from '../../core/models';
import { BadgeComponent } from '../../shared/badge';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ReactiveFormsModule, BadgeComponent],
  templateUrl: './clients.html',
})
export class ClientsComponent implements OnInit {
  private svc = inject(ClientService);
  private merchantSvc = inject(MerchantService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Client[]>([]);
  merchants = signal<Merchant[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', Validators.email],
    address: ['', Validators.required],
    city: [''],
    landmark: [''],
    merchantId: [null as number | null, Validators.required],
  });

  ngOnInit() {
    this.load();
    this.merchantSvc.getAll().subscribe(d => this.merchants.set(d));
  }
  load() { this.loading.set(true); this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.editingId.set(null); this.form.reset(); this.showModal.set(true); }
  openEdit(item: Client) { this.editingId.set(item.id); this.form.patchValue(item); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId() ? this.svc.update(this.editingId()!, this.form.value as any) : this.svc.create(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  delete(id: number) {
    if (!confirm('Delete this client?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }
  merchantName(id?: number) { return this.merchants().find(m => m.id === id)?.storeName ?? '-'; }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
