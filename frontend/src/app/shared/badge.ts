import { Component, Input } from '@angular/core';

const STATUS_CLASSES: Record<string, { bg: string; text: string; glow?: string }> = {
  // Order / general
  DRAFT:            { bg: 'rgba(195, 198, 208, 0.08)', text: '#c3c6d0' },
  CONFIRMED:        { bg: 'rgba(169, 200, 252, 0.10)', text: '#a9c8fc' },
  CANCELLED:        { bg: 'rgba(255, 180, 171, 0.10)', text: '#ffb4ab' },
  READY_FOR_PICKUP: { bg: 'rgba(255, 200, 120, 0.10)', text: '#ffc878' },
  PENDING:          { bg: 'rgba(255, 200, 120, 0.10)', text: '#ffc878' },
  IN_TRANSIT:       { bg: 'rgba(169, 200, 252, 0.12)', text: '#a9c8fc', glow: 'rgba(169,200,252,0.15)' },
  DELIVERED:        { bg: 'rgba(96, 220, 178, 0.10)', text: '#60dcb2', glow: 'rgba(96,220,178,0.1)' },
  RETURNED:         { bg: 'rgba(255, 180, 171, 0.10)', text: '#ffb4ab' },
  PAID:             { bg: 'rgba(96, 220, 178, 0.10)', text: '#60dcb2', glow: 'rgba(96,220,178,0.1)' },
  SENT:             { bg: 'rgba(169, 200, 252, 0.10)', text: '#a9c8fc' },
  // Payment methods
  PREPAID:          { bg: 'rgba(195, 198, 208, 0.08)', text: '#c3c6d0' },
  COD:              { bg: 'rgba(198, 196, 223, 0.12)', text: '#c6c4df' },
  // Returns
  REFUSED:          { bg: 'rgba(255, 180, 171, 0.10)', text: '#ffb4ab' },
  NOT_FOUND:        { bg: 'rgba(255, 200, 120, 0.10)', text: '#ffc878' },
  DAMAGED:          { bg: 'rgba(255, 180, 171, 0.10)', text: '#ffb4ab' },
  // Roles
  ADMIN:            { bg: 'rgba(169, 200, 252, 0.15)', text: '#a9c8fc' },
  MANAGER:          { bg: 'rgba(169, 200, 252, 0.10)', text: '#a9c8fc' },
  DISPATCHER:       { bg: 'rgba(198, 196, 223, 0.12)', text: '#c6c4df' },
  RIDER:            { bg: 'rgba(96, 220, 178, 0.10)', text: '#60dcb2' },
  MERCHANT:         { bg: 'rgba(198, 196, 223, 0.12)', text: '#c6c4df' },
  WAREHOUSE:        { bg: 'rgba(255, 200, 120, 0.10)', text: '#ffc878' },
  // Types
  service:          { bg: 'rgba(169, 200, 252, 0.10)', text: '#a9c8fc' },
  article:          { bg: 'rgba(96, 220, 178, 0.10)', text: '#60dcb2' },
};

const DEFAULT_STYLE = { bg: 'rgba(195, 198, 208, 0.08)', text: '#c3c6d0' };

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="nf-badge"
          [style.background]="style.bg"
          [style.color]="style.text"
          [style.box-shadow]="style.glow ? '0 0 8px 1px ' + style.glow : 'none'">
      {{ value }}
    </span>
  `,
  styles: [`
    .nf-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
  `],
})
export class BadgeComponent {
  @Input() value = '';
  get style() {
    return STATUS_CLASSES[this.value] ?? DEFAULT_STYLE;
  }
}
