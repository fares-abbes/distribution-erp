import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  success(message: string): void { this.add(message, 'success'); }
  error(message: string): void { this.add(message, 'error'); }
  info(message: string): void { this.add(message, 'info'); }

  private add(message: string, type: Toast['type']): void {
    const id = Date.now();
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.remove(id), 3500);
  }

  remove(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
