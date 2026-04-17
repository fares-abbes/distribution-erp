import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MerchantService } from '../../core/services/merchant.service';
import { ToastService } from '../../shared/toast.service';
import { Merchant } from '../../core/models';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './merchants.html',
})
export class MerchantsComponent implements OnInit {
  private svc = inject(MerchantService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Merchant[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    storeName: ['', Validators.required],
    contactPerson: [''],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    address: [''],
    taxId: [''],
    websiteUrl: [''],
    commissionRate: [0],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openCreate() { this.editingId.set(null); this.form.reset({ commissionRate: 0 }); this.showModal.set(true); }

  openEdit(item: Merchant) {
    this.editingId.set(item.id);
    this.form.patchValue(item);
    this.showModal.set(true);
  }

  close() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, this.form.value as any)
      : this.svc.create(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  delete(id: number) {
    if (!confirm('Delete this merchant?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }

  err(field: string) { const c = this.form.get(field); return c?.invalid && c?.touched; }
}
