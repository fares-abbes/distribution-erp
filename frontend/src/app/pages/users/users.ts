import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ToastService } from '../../shared/toast.service';
import { User, Merchant, UserRole } from '../../core/models';
import { BadgeComponent } from '../../shared/badge';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, BadgeComponent],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private svc = inject(UserService);
  private merchantSvc = inject(MerchantService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<User[]>([]);
  merchants = signal<Merchant[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  roles: UserRole[] = ['ADMIN','MANAGER','DISPATCHER','RIDER','MERCHANT','WAREHOUSE'];

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: [''],
    role: ['', Validators.required],
    merchantRecordId: [null as number | null],
  });

  ngOnInit() {
    this.load();
    this.merchantSvc.getAll().subscribe(d => this.merchants.set(d));
  }
  load() { this.loading.set(true); this.svc.getAll().subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.editingId.set(null); this.form.reset(); this.form.get('password')!.setValidators(Validators.required); this.showModal.set(true); }
  openEdit(item: User) {
    this.editingId.set(item.id);
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.form.patchValue({ ...item, password: '' });
    this.showModal.set(true);
  }
  close() { this.showModal.set(false); }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.value as any;
    if (!val.password) delete val.password;
    const obs = this.editingId() ? this.svc.update(this.editingId()!, val) : this.svc.create(val);
    obs.subscribe({ next: () => { this.toast.success('Saved'); this.close(); this.load(); }, error: (e) => this.toast.error(e?.error?.message ?? 'Error') });
  }
  delete(id: number) {
    if (!confirm('Delete this user?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); }, error: () => this.toast.error('Error') });
  }
  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
}
