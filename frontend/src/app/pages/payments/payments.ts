import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ToastService } from '../../shared/toast.service';
import { Payment, Merchant, PaymentMethod, PaymentStatus } from '../../core/models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './payments.html',
})
export class PaymentsComponent implements OnInit {
  private svc = inject(PaymentService);
  private merchantSvc = inject(MerchantService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Payment[]>([]);
  merchants = signal<Merchant[]>([]);
  selectedMerchantId = signal<number | null>(null);
  loading = signal(false);
  showModal = signal(false);
  methods: PaymentMethod[] = ['CASH','BANK_TRANSFER','CHEQUE'];
  statuses: PaymentStatus[] = ['PENDING','PAID'];

  form = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['CASH', Validators.required],
    reference: [''],
    notes: [''],
    merchantId: [null as number | null, Validators.required],
    orderId: [null as number | null],
    status: ['PENDING', Validators.required],
  });

  ngOnInit() { this.merchantSvc.getAll().subscribe(d => { this.merchants.set(d); if (d[0]) this.selectMerchant(d[0].id); }); }

  selectMerchant(id: number) {
    this.selectedMerchantId.set(id);
    this.loading.set(true);
    this.svc.getByMerchant(id).subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openCreate() { this.form.reset({ method: 'CASH', status: 'PENDING', merchantId: this.selectedMerchantId(), amount: 0 }); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.create(this.form.value).subscribe({ next: () => { this.toast.success('Payment recorded'); this.close(); if (this.selectedMerchantId()) this.selectMerchant(this.selectedMerchantId()!); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  markPaid(p: Payment) {
    this.svc.updateStatus(p.id, { status: 'PAID', reference: p.reference }).subscribe({ next: () => { this.toast.success('Marked as paid'); if (this.selectedMerchantId()) this.selectMerchant(this.selectedMerchantId()!); }, error: () => this.toast.error('Error') });
  }

  merchantName(id?: number) { return this.merchants().find(m => m.id === id)?.storeName ?? '-'; }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
