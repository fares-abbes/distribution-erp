import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { ToastService } from '../../shared/toast.service';
import { Vehicle, VehicleType } from '../../core/models';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './vehicles.html',
})
export class VehiclesComponent implements OnInit {
  private svc = inject(VehicleService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Vehicle[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  vehicleTypes: VehicleType[] = ['MOTORCYCLE', 'CAR', 'VAN', 'BICYCLE', 'TRUCK'];

  form = this.fb.group({
    plateNumber: ['', Validators.required],
    type:        ['' as VehicleType | '', Validators.required],
    brand:       [''],
    model:       [''],
    year:        [null as number | null],
  });

  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.editingId.set(null); this.form.reset(); this.showModal.set(true); }
  openEdit(item: Vehicle) { this.editingId.set(item.id); this.form.patchValue(item); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, this.form.value as any)
      : this.svc.create(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  delete(id: number) {
    if (!confirm('Delete this vehicle?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
