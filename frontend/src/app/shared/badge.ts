import { Component, Input } from '@angular/core';

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-600',
  READY_FOR_PICKUP: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-orange-50 text-orange-700',
  IN_TRANSIT: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700',
  RETURNED: 'bg-red-50 text-red-600',
  PAID: 'bg-green-50 text-green-700',
  SENT: 'bg-blue-50 text-blue-700',
  PREPAID: 'bg-slate-100 text-slate-600',
  COD: 'bg-purple-50 text-purple-700',
  REFUSED: 'bg-red-50 text-red-600',
  NOT_FOUND: 'bg-orange-50 text-orange-700',
  DAMAGED: 'bg-red-50 text-red-600',
  ADMIN: 'bg-slate-800 text-white',
  MANAGER: 'bg-blue-50 text-blue-700',
  DISPATCHER: 'bg-indigo-50 text-indigo-700',
  RIDER: 'bg-green-50 text-green-700',
  MERCHANT: 'bg-purple-50 text-purple-700',
  WAREHOUSE: 'bg-orange-50 text-orange-700',
  service: 'bg-sky-50 text-sky-700',
  article: 'bg-teal-50 text-teal-700',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {{ badgeClass }}">
      {{ value }}
    </span>
  `,
})
export class BadgeComponent {
  @Input() value = '';
  get badgeClass(): string {
    return STATUS_CLASSES[this.value] ?? 'bg-slate-100 text-slate-600';
  }
}
