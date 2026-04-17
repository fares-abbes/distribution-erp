import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ShipmentService } from '../../core/services/shipment.service';
import { RiderService } from '../../core/services/rider.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { Shipment, Rider, ShipmentStatus } from '../../core/models';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './shipments.html',
})
export class ShipmentsComponent implements OnInit {
  private svc = inject(ShipmentService);
  private riderSvc = inject(RiderService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Shipment[]>([]);
  riders = signal<Rider[]>([]);
  loading = signal(false);
  showStatusModal = signal(false);
  showRiderModal = signal(false);
  showLogsModal = signal(false);
  target = signal<Shipment | null>(null);
  statuses: ShipmentStatus[] = ['READY_FOR_PICKUP','PENDING','IN_TRANSIT','DELIVERED','RETURNED'];

  statusForm = this.fb.group({ status: ['', Validators.required], statusDescription: [''] });
  riderForm = this.fb.group({ riderId: [null as number | null, Validators.required] });

  ngOnInit() {
    this.load();
    this.riderSvc.getAll().subscribe(d => this.riders.set(d));
  }
  load() {
    this.loading.set(true);
    const req = this.auth.hasRole('RIDER') ? this.svc.getMyShipments() : this.svc.getAll();
    req.subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openStatus(s: Shipment) { this.target.set(s); this.statusForm.reset({ status: s.currentStatus }); this.showStatusModal.set(true); }
  closeStatus() { this.showStatusModal.set(false); }
  saveStatus() {
    if (this.statusForm.invalid) return;
    const v = this.statusForm.value;
    this.svc.updateStatus(this.target()!.id, v.status as ShipmentStatus, v.statusDescription ?? undefined)
      .subscribe({ next: () => { this.toast.success('Status updated'); this.closeStatus(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  openRider(s: Shipment) { this.target.set(s); this.riderForm.reset({ riderId: s.riderId ?? null }); this.showRiderModal.set(true); }
  closeRider() { this.showRiderModal.set(false); }
  saveRider() {
    if (this.riderForm.invalid) return;
    this.svc.assignRider(this.target()!.id, this.riderForm.value.riderId!)
      .subscribe({ next: () => { this.toast.success('Rider assigned'); this.closeRider(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }

  openLogs(s: Shipment) { this.target.set(s); this.showLogsModal.set(true); }
  closeLogs() { this.showLogsModal.set(false); }

  riderName(id?: number) { return this.riders().find(r => r.id === id)?.name ?? '-'; }
}
