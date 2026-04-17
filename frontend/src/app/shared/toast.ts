import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @for (t of svc.toasts(); track t.id) {
      <div class="nf-toast" [class.nf-toast--error]="t.type === 'error'" [class.nf-toast--success]="t.type === 'success'" [class.nf-toast--info]="t.type === 'info'">
        <span class="material-icons-round nf-toast__icon">
          {{ t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info' }}
        </span>
        <span class="nf-toast__text">{{ t.message }}</span>
        <button class="nf-toast__close" (click)="svc.remove(t.id)">
          <span class="material-icons-round" style="font-size: 16px;">close</span>
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nf-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 500;
      animation: nf-slide-up 0.3s ease-out both;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .nf-toast--success {
      background: rgba(0, 60, 44, 0.85);
      color: var(--tertiary);
      border: 1px solid rgba(96, 220, 178, 0.2);
      box-shadow: 0 0 24px 4px rgba(96, 220, 178, 0.1);
    }
    .nf-toast--error {
      background: rgba(147, 0, 10, 0.85);
      color: var(--error);
      border: 1px solid rgba(255, 180, 171, 0.2);
      box-shadow: 0 0 24px 4px rgba(255, 180, 171, 0.1);
    }
    .nf-toast--info {
      background: rgba(15, 52, 96, 0.85);
      color: var(--primary);
      border: 1px solid rgba(169, 200, 252, 0.2);
      box-shadow: 0 0 24px 4px rgba(169, 200, 252, 0.1);
    }
    .nf-toast__icon {
      font-size: 20px;
    }
    .nf-toast__text {
      letter-spacing: 0.01em;
      flex: 1;
    }
    .nf-toast__close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      padding: 0;
      display: flex;
    }
    .nf-toast__close:hover {
      opacity: 1;
    }
  `],
})
export class ToastComponent {
  svc = inject(ToastService);
}
