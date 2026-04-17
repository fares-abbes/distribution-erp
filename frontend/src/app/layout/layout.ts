import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BadgeComponent } from '../shared/badge';
import { ToastComponent } from '../shared/toast';

interface NavItem { label: string; path: string; icon: string; roles: string[]; }

const NAV: NavItem[] = [
  { label: 'Dashboard',  path: '/dashboard',  icon: 'dashboard',       roles: [] },
  { label: 'Orders',     path: '/orders',     icon: 'shopping_cart',   roles: ['ADMIN','MANAGER','MERCHANT','DISPATCHER'] },
  { label: 'Shipments',  path: '/shipments',  icon: 'local_shipping',  roles: ['ADMIN','MANAGER','DISPATCHER','RIDER'] },
  { label: 'Products',   path: '/products',   icon: 'inventory_2',     roles: ['ADMIN','MANAGER','MERCHANT','WAREHOUSE'] },
  { label: 'Warehouses', path: '/warehouses', icon: 'warehouse',        roles: ['ADMIN','MANAGER','WAREHOUSE'] },
  { label: 'Clients',    path: '/clients',    icon: 'people',          roles: ['ADMIN','MANAGER','MERCHANT'] },
  { label: 'Merchants',  path: '/merchants',  icon: 'storefront',      roles: ['ADMIN','MANAGER'] },
  { label: 'Riders',     path: '/riders',     icon: 'two_wheeler',     roles: ['ADMIN','MANAGER','DISPATCHER'] },
  { label: 'Vehicles',   path: '/vehicles',   icon: 'directions_car',  roles: ['ADMIN','MANAGER','DISPATCHER'] },
  { label: 'Zones',      path: '/zones',      icon: 'map',             roles: ['ADMIN','MANAGER','DISPATCHER'] },
  { label: 'Payments',   path: '/payments',   icon: 'payments',        roles: ['ADMIN','MANAGER'] },
  { label: 'Returns',    path: '/returns',    icon: 'assignment_return',roles: ['ADMIN','MANAGER','DISPATCHER','MERCHANT'] },
  { label: 'Invoices',   path: '/invoices',   icon: 'receipt_long',    roles: ['ADMIN','MANAGER','MERCHANT'] },
  { label: 'Users',      path: '/users',      icon: 'admin_panel_settings', roles: ['ADMIN', 'MANAGER'] },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Unified Command', orders: 'Order Matrix', shipments: 'Shipment Tracking',
  products: 'Product Catalog', warehouses: 'Warehouse Management', clients: 'Client Network', merchants: 'Merchant Catalog',
  riders: 'Rider Operations', vehicles: 'Fleet Management', zones: 'Zone Optimization', payments: 'Financial Suite',
  returns: 'Return Processing', invoices: 'Invoice Ledger', users: 'Access Control',
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BadgeComponent, ToastComponent],
  templateUrl: './layout.html',
  styles: [`
    /* ── App Shell ── */
    .nf-app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--surface);
    }

    /* ── Sidebar ── */
    .nf-sidebar {
      width: 260px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: var(--surface-container-low);
      border-right: 1px solid rgba(67, 71, 79, 0.15);
    }

    .nf-sidebar__logo {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      flex-shrink: 0;
    }

    .nf-logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary-container) 0%, #1a4580 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px 2px rgba(169, 200, 252, 0.15);
    }

    .nf-logo-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--on-surface);
      letter-spacing: -0.02em;
    }
    .nf-logo-subtitle {
      font-size: 0.625rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: block;
      margin-top: -2px;
    }

    /* ── Nav ── */
    .nf-sidebar__nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nf-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      color: var(--on-surface-variant);
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
    }
    .nf-nav-item:hover {
      color: var(--on-surface);
      background: var(--surface-container);
    }
    .nf-nav-item--active {
      color: var(--primary) !important;
      background: rgba(169, 200, 252, 0.08) !important;
    }
    .nf-nav-item--active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
    }
    .nf-nav-item__icon {
      font-size: 20px;
      opacity: 0.7;
    }
    .nf-nav-item--active .nf-nav-item__icon {
      opacity: 1;
    }

    /* ── Status ── */
    .nf-sidebar__status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      margin: 0 12px;
      border-radius: 10px;
      background: var(--surface-container);
    }
    .nf-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--tertiary);
      box-shadow: 0 0 8px 2px rgba(96, 220, 178, 0.3);
      animation: nf-glow-pulse 2s ease-in-out infinite;
    }
    .nf-status-text {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      letter-spacing: 0.02em;
    }

    /* ── User ── */
    .nf-sidebar__user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-top: 1px solid rgba(67, 71, 79, 0.15);
      flex-shrink: 0;
    }
    .nf-user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary-container) 0%, #1a4580 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    .nf-user-info {
      flex: 1;
      min-width: 0;
    }
    .nf-user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nf-user-role {
      font-size: 0.6875rem;
      color: var(--on-surface-variant);
      text-transform: capitalize;
    }
    .nf-logout-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--on-surface-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .nf-logout-btn:hover {
      color: var(--error);
      background: rgba(255, 180, 171, 0.08);
    }

    /* ── Main ── */
    .nf-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--surface);
    }

    .nf-topbar {
      height: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      background: var(--surface-container-low);
      border-bottom: 1px solid rgba(67, 71, 79, 0.15);
    }
    .nf-page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--on-surface);
      letter-spacing: -0.01em;
    }
    .nf-topbar__right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nf-content {
      flex: 1;
      overflow: auto;
      padding: 28px;
    }
  `],
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  visibleNav = computed(() =>
    NAV.filter(item => item.roles.length === 0 || item.roles.some(r => this.auth.hasRole(r)))
  );

  pageTitle = computed(() => {
    const segment = this.router.url.split('/')[1]?.split('?')[0] ?? '';
    return PAGE_TITLES[segment] ?? 'NexFlow ERP';
  });

  get userInitial(): string {
    return (this.auth.username()[0] ?? '?').toUpperCase();
  }
}
