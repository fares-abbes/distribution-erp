import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { User, UserRole, Vehicle } from '../../core/models';

const ALL_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'DISPATCHER', 'RIDER', 'MERCHANT', 'WAREHOUSE'];
const MANAGER_ALLOWED_ROLES: UserRole[] = ['DISPATCHER', 'RIDER', 'MERCHANT', 'WAREHOUSE'];

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private svc = inject(UserService);
  private vehicleSvc = inject(VehicleService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  items = signal<User[]>([]);
  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);

  availableRoles = computed<UserRole[]>(() =>
    this.auth.hasRole('ADMIN') ? ALL_ROLES : MANAGER_ALLOWED_ROLES
  );

  selectedRole = signal<UserRole | null>(null);

  form = this.fb.group({
    username:       ['', Validators.required],
    password:       [''],
    fullName:       ['', Validators.required],
    email:          ['', Validators.email],
    phoneNumber:    [''],
    role:           ['' as UserRole | '', Validators.required],
    // RIDER fields
    vehicleId:      [null as number | null],
    // MERCHANT fields
    storeName:      [''],
    commissionRate: [null as number | null],
    taxId:          [''],
    address:        [''],
    websiteUrl:     [''],
  });

  ngOnInit() {
    this.load();
    this.vehicleSvc.getAll().subscribe({ next: v => this.vehicles.set(v) });

    this.form.get('role')!.valueChanges.subscribe(v => {
      const role = v as UserRole ?? null;
      this.selectedRole.set(role);

      // Apply/remove storeName required validator
      const storeCtrl = this.form.get('storeName')!;
      if (role === 'MERCHANT') {
        storeCtrl.setValidators(Validators.required);
      } else {
        storeCtrl.clearValidators();
      }
      storeCtrl.updateValueAndValidity();
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.items.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset();
    this.selectedRole.set(null);
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEdit(item: User) {
    this.editingId.set(item.id);
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.selectedRole.set(item.role);
    this.form.patchValue({
      username:       item.username,
      password:       '',
      fullName:       item.fullName,
      email:          item.email ?? '',
      phoneNumber:    item.phoneNumber ?? '',
      role:           item.role,
      vehicleId:      (item as any).vehicleId ?? null,
      storeName:      (item as any).storeName ?? '',
      commissionRate: (item as any).commissionRate ?? null,
      taxId:          (item as any).taxId ?? '',
      address:        (item as any).address ?? '',
      websiteUrl:     (item as any).websiteUrl ?? '',
    });
    this.showModal.set(true);
  }

  close() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = { ...this.form.value };
    if (!val.password) delete (val as any).password;

    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, val as any)
      : this.svc.create(val as any);

    obs.subscribe({
      next: () => {
        this.toast.success('User saved and provisioned in Keycloak');
        this.close();
        this.load();
        this.saving.set(false);
      },
      error: (e) => {
        this.toast.error(e?.error?.message ?? 'Failed to save user');
        this.saving.set(false);
      },
    });
  }

  delete(id: number) {
    if (!confirm('Deactivate this user? They will lose access immediately.')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.toast.success('User deactivated'); this.load(); },
      error: () => this.toast.error('Error deactivating user'),
    });
  }

  err(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }

  roleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'ADMIN':      return 'nf-status info';
      case 'MANAGER':    return 'nf-status info';
      case 'DISPATCHER': return 'nf-status ok';
      case 'RIDER':      return 'nf-status ok';
      case 'MERCHANT':   return 'nf-status warn';
      case 'WAREHOUSE':  return 'nf-status muted';
      default:           return 'nf-status muted';
    }
  }

  linkedLabel(item: User): string {
    if (item.role === 'MERCHANT' && item.merchantRecordId) return 'Merchant #' + item.merchantRecordId;
    if (item.role === 'RIDER'    && item.riderRecordId)    return 'Rider #'    + item.riderRecordId;
    return '—';
  }

  linkedColor(item: User): string {
    if (item.role === 'MERCHANT' && item.merchantRecordId) return 'var(--primary)';
    if (item.role === 'RIDER'    && item.riderRecordId)    return 'var(--tertiary)';
    return '';
  }
}
