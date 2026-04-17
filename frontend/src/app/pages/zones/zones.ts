import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ZoneService } from '../../core/services/zone.service';
import { ToastService } from '../../shared/toast.service';
import { Zone } from '../../core/models';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './zones.html',
})
export class ZonesComponent implements OnInit {
  private svc = inject(ZoneService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Zone[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    cityOrRegion: ['', Validators.required],
    baseDeliveryFee: [0, Validators.required],
    estimatedDaysMin: [1],
    estimatedDaysMax: [3],
  });

  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.editingId.set(null); this.form.reset({ baseDeliveryFee: 0, estimatedDaysMin: 1, estimatedDaysMax: 3 }); this.showModal.set(true); }
  openEdit(item: Zone) { this.editingId.set(item.id); this.form.patchValue(item); this.showModal.set(true); }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const obs = this.editingId() ? this.svc.update(this.editingId()!, this.form.value as any) : this.svc.create(this.form.value as any);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  delete(id: number) {
    if (!confirm('Delete this zone?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
