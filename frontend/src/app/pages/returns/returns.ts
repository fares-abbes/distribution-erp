import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReturnService } from '../../core/services/return.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ToastService } from '../../shared/toast.service';
import { ReturnOrder, Merchant, ReturnReason } from '../../core/models';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './returns.html',
})
export class ReturnsComponent implements OnInit {
  private svc = inject(ReturnService);
  private merchantSvc = inject(MerchantService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<ReturnOrder[]>([]);
  merchants = signal<Merchant[]>([]);
  selectedMerchantId = signal<number | null>(null);
  loading = signal(false);
  showModal = signal(false);
  reasons: ReturnReason[] = ['REFUSED','NOT_FOUND','DAMAGED'];

  form = this.fb.group({
    shipmentId: [null as number | null, Validators.required],
    merchantId: [null as number | null, Validators.required],
    reason: ['', Validators.required],
    restockApproved: [false],
  });

  ngOnInit() { this.merchantSvc.getAll().subscribe(d => { this.merchants.set(d); if (d[0]) this.selectMerchant(d[0].id); }); }

  selectMerchant(id: number) {
    this.selectedMerchantId.set(id);
    this.loading.set(true);
    this.svc.getByMerchant(id).subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openCreate() { this.form.reset({ restockApproved: false, merchantId: this.selectedMerchantId() }); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.create(this.form.value).subscribe({ next: () => { this.toast.success('Return registered'); this.close(); if (this.selectedMerchantId()) this.selectMerchant(this.selectedMerchantId()!); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
