import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RiderService } from '../../core/services/rider.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { ToastService } from '../../shared/toast.service';
import { Rider, Vehicle } from '../../core/models';

@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './riders.html',
})
export class RidersComponent implements OnInit {
  private svc = inject(RiderService);
  private vehicleSvc = inject(VehicleService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Rider[]>([]);
  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    vehicleId: [null as number | null],
  });

  ngOnInit() {
    this.load();
    this.vehicleSvc.getAll().subscribe({ next: v => this.vehicles.set(v) });
  }

  load() { this.loading.set(true); this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.editingId.set(null); this.form.reset(); this.showModal.set(true); }
  openEdit(item: Rider) {
    this.editingId.set(item.id);
    this.form.patchValue({ name: item.name, phone: item.phone, vehicleId: item.vehicleId ?? null });
    this.showModal.set(true);
  }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId() ? this.svc.update(this.editingId()!, this.form.value as any) : this.svc.create(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  delete(id: number) {
    if (!confirm('Delete this rider?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }

  vehicleLabel(item: Rider): string {
    if (item.vehicle) return `${item.vehicle.type} — ${item.vehicle.plateNumber}`;
    return 'Unassigned';
  }
}
