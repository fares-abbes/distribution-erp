import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BadgeComponent } from '../shared/badge';
import { ToastComponent } from '../shared/toast';

interface NavItem { label: string; path: string; roles: string[]; }

const NAV: NavItem[] = [
  { label: 'Dashboard',  path: '/dashboard',  roles: [] },
  { label: 'Orders',     path: '/orders',     roles: ['ADMIN','MANAGER','MERCHANT','DISPATCHER'] },
  { label: 'Shipments',  path: '/shipments',  roles: ['ADMIN','MANAGER','DISPATCHER','RIDER'] },
  { label: 'Products',   path: '/products',   roles: ['ADMIN','MANAGER','MERCHANT','WAREHOUSE'] },
  { label: 'Clients',    path: '/clients',    roles: ['ADMIN','MANAGER','MERCHANT'] },
  { label: 'Merchants',  path: '/merchants',  roles: ['ADMIN','MANAGER'] },
  { label: 'Riders',     path: '/riders',     roles: ['ADMIN','MANAGER','DISPATCHER'] },
  { label: 'Zones',      path: '/zones',      roles: ['ADMIN','MANAGER','DISPATCHER'] },
  { label: 'Payments',   path: '/payments',   roles: ['ADMIN','MANAGER'] },
  { label: 'Returns',    path: '/returns',    roles: ['ADMIN','MANAGER','DISPATCHER','MERCHANT'] },
  { label: 'Invoices',   path: '/invoices',   roles: ['ADMIN','MANAGER','MERCHANT'] },
  { label: 'Users',      path: '/users',      roles: ['ADMIN'] },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard', orders: 'Orders', shipments: 'Shipments',
  products: 'Products', clients: 'Clients', merchants: 'Merchants',
  riders: 'Riders', zones: 'Delivery Zones', payments: 'Payments',
  returns: 'Returns', invoices: 'Invoices', users: 'Users',
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BadgeComponent, ToastComponent],
  templateUrl: './layout.html',
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  visibleNav = computed(() =>
    NAV.filter(item => item.roles.length === 0 || item.roles.some(r => this.auth.hasRole(r)))
  );

  pageTitle = computed(() => {
    const segment = this.router.url.split('/')[1]?.split('?')[0] ?? '';
    return PAGE_TITLES[segment] ?? 'DistribERP';
  });

  get userInitial(): string {
    return (this.auth.username()[0] ?? '?').toUpperCase();
  }
}
