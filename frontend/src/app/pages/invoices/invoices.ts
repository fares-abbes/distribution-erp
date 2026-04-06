import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { InvoiceService } from '../../core/services/invoice.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ToastService } from '../../shared/toast.service';
import { Invoice, Merchant, InvoiceStatus } from '../../core/models';
import { BadgeComponent } from '../../shared/badge';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BadgeComponent, DatePipe, DecimalPipe],
  templateUrl: './invoices.html',
})
export class InvoicesComponent implements OnInit {
  private svc = inject(InvoiceService);
  private merchantSvc = inject(MerchantService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Invoice[]>([]);
  merchants = signal<Merchant[]>([]);
  selectedMerchantId = signal<number | null>(null);
  loading = signal(false);
  showModal = signal(false);
  statuses: InvoiceStatus[] = ['DRAFT','SENT','PAID'];

  form = this.fb.group({
    merchantId: [null as number | null, Validators.required],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
  });

  ngOnInit() { this.merchantSvc.getAll().subscribe(d => { this.merchants.set(d); if (d[0]) this.selectMerchant(d[0].id); }); }

  selectMerchant(id: number) {
    this.selectedMerchantId.set(id);
    this.loading.set(true);
    this.svc.getByMerchant(id).subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openGenerate() { this.form.reset({ merchantId: this.selectedMerchantId() }); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  generate() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.generate(this.form.value).subscribe({ next: () => { this.toast.success('Invoice generated'); this.close(); if (this.selectedMerchantId()) this.selectMerchant(this.selectedMerchantId()!); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  updateStatus(inv: Invoice, status: InvoiceStatus) {
    this.svc.updateStatus(inv.id, status).subscribe({ next: () => { this.toast.success('Status updated'); if (this.selectedMerchantId()) this.selectMerchant(this.selectedMerchantId()!); }, error: () => this.toast.error('Error') });
  }

  merchantName(id?: number) { return this.merchants().find(m => m.id === id)?.storeName ?? '-'; }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
