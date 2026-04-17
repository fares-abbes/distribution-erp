import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ProductService } from '../../core/services/product.service';
import { ClientService } from '../../core/services/client.service';
import { RiderService } from '../../core/services/rider.service';
import { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styles: [`
    /* ── Dashboard Layout ── */
    .nf-dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Hero ── */
    .nf-hero {
      background: linear-gradient(135deg, var(--surface-container) 0%, var(--surface-container-low) 100%);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
    }
    .nf-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(169, 200, 252, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .nf-hero__greeting {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .nf-hero__title {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--on-surface);
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .nf-hero__subtitle {
      font-size: 0.875rem;
      color: var(--on-surface-variant);
    }
    .nf-hero__indicators {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }
    .nf-hero__indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--surface-container-high);
    }
    .nf-hero__indicator-text {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
    }

    /* ── KPI Grid ── */
    .nf-kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .nf-kpi-card {
      background: var(--surface-container);
      border-radius: 14px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }
    .nf-kpi-card:hover {
      background: var(--surface-container-high);
    }
    .nf-kpi-card__label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nf-kpi-card__label .material-icons-round {
      font-size: 16px;
      opacity: 0.7;
    }
    .nf-kpi-card__value {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--on-surface);
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .nf-kpi-card__value--revenue {
      font-size: 1.75rem;
      color: var(--tertiary);
    }
    .nf-kpi-card__sub {
      font-size: 0.75rem;
      color: var(--on-surface-variant);
      margin-top: 6px;
    }
    .nf-kpi-card__glow {
      position: absolute;
      top: -20px;
      right: -20px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      opacity: 0.06;
      pointer-events: none;
    }
    .nf-kpi-card__glow--primary { background: var(--primary); }
    .nf-kpi-card__glow--tertiary { background: var(--tertiary); }

    /* ── Telemetry Grid (legacy cards) ── */
    .nf-telemetry-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .nf-telemetry-card {
      background: var(--surface-container);
      border-radius: 14px;
      padding: 20px;
      text-decoration: none;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .nf-telemetry-card:hover {
      background: var(--surface-container-high);
      box-shadow: 0 0 32px 4px rgba(169, 200, 252, 0.06);
    }
    .nf-telemetry-card__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .nf-telemetry-card__icon {
      font-size: 18px;
      color: var(--primary);
      opacity: 0.7;
    }
    .nf-telemetry-card__label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      letter-spacing: 0.06em;
    }
    .nf-telemetry-card__value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--on-surface);
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .nf-telemetry-card__link {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--primary);
      opacity: 0;
      transition: opacity 0.2s ease;
      display: block;
      margin-top: 8px;
    }
    .nf-telemetry-card:hover .nf-telemetry-card__link { opacity: 1; }

    /* ── Section Header ── */
    .nf-section__title {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
    }

    /* ── Analytics Row ── */
    .nf-analytics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .nf-analytics-card {
      background: var(--surface-container);
      border-radius: 14px;
      padding: 24px;
    }
    .nf-analytics-card__title {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 20px;
    }

    /* Status breakdown */
    .nf-status-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .nf-status-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nf-status-row__label {
      font-size: 0.75rem;
      color: var(--on-surface-variant);
      width: 120px;
      flex-shrink: 0;
    }
    .nf-status-bar-track {
      flex: 1;
      height: 6px;
      background: var(--surface-container-high);
      border-radius: 3px;
      overflow: hidden;
    }
    .nf-status-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s ease;
    }
    .nf-status-bar-fill--draft      { background: var(--on-surface-variant); }
    .nf-status-bar-fill--confirmed  { background: var(--tertiary); }
    .nf-status-bar-fill--cancelled  { background: #ff6b6b; }
    .nf-status-bar-fill--pickup     { background: var(--primary); opacity: 0.6; }
    .nf-status-bar-fill--transit    { background: var(--primary); }
    .nf-status-bar-fill--delivered  { background: var(--tertiary); }
    .nf-status-bar-fill--returned   { background: #ff6b6b; }
    .nf-status-bar-fill--pending    { background: var(--on-surface-variant); opacity: 0.5; }
    .nf-status-row__count {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--on-surface);
      width: 32px;
      text-align: right;
      flex-shrink: 0;
    }

    /* ── Revenue Chart ── */
    .nf-revenue-card {
      background: var(--surface-container);
      border-radius: 14px;
      padding: 24px;
    }
    .nf-revenue-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .nf-revenue-card__title {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .nf-revenue-card__total {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--tertiary);
      letter-spacing: -0.02em;
    }
    .nf-revenue-card__sub {
      font-size: 0.6875rem;
      color: var(--on-surface-variant);
      margin-bottom: 20px;
    }
    .nf-bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 80px;
    }
    .nf-bar {
      flex: 1;
      border-radius: 2px 2px 0 0;
      background: var(--primary);
      opacity: 0.5;
      transition: opacity 0.2s ease, height 0.5s ease;
      min-height: 2px;
    }
    .nf-bar:hover {
      opacity: 1;
    }
    .nf-bar--has-data {
      opacity: 0.7;
    }

    /* ── Quick Actions ── */
    .nf-quick-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .nf-quick-card {
      background: var(--surface-container);
      border-radius: 14px;
      padding: 20px;
      text-decoration: none;
      text-align: center;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .nf-quick-card:hover {
      background: var(--surface-container-high);
    }
    .nf-quick-card__icon {
      font-size: 28px;
      color: var(--primary);
      margin-bottom: 10px;
      opacity: 0.8;
      display: block;
    }
    .nf-quick-card:hover .nf-quick-card__icon { opacity: 1; }
    .nf-quick-card__title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--on-surface);
      margin-bottom: 4px;
    }
    .nf-quick-card__desc {
      font-size: 0.6875rem;
      color: var(--on-surface-variant);
    }

    /* ── Loading ── */
    .nf-loading-pulse {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .nf-loading-pulse span {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--primary);
      animation: pulse 1.2s ease-in-out infinite;
    }
    .nf-loading-pulse span:nth-child(2) { animation-delay: 0.2s; }
    .nf-loading-pulse span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 1100px) {
      .nf-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 900px) {
      .nf-telemetry-grid,
      .nf-quick-grid { grid-template-columns: repeat(2, 1fr); }
      .nf-analytics-row { grid-template-columns: 1fr; }
      .nf-kpi-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .nf-kpi-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private dashboardSvc = inject(DashboardService);
  private merchantSvc = inject(MerchantService);
  private productSvc = inject(ProductService);
  private clientSvc = inject(ClientService);
  private riderSvc = inject(RiderService);

  // Simple counts (for users without ADMIN/MANAGER)
  merchants = signal(0);
  products = signal(0);
  clients = signal(0);
  riders = signal(0);

  // Full analytics (ADMIN/MANAGER only)
  stats = signal<DashboardStats | null>(null);
  loadingStats = signal(true);

  // Computed chart values
  totalShipments = computed(() => {
    const s = this.stats();
    if (!s) return 1;
    return (s.readyForPickupShipments + s.pendingShipments + s.inTransitShipments + s.deliveredShipments + s.returnedShipments) || 1;
  });

  maxDailyRevenue = computed(() => {
    const s = this.stats();
    if (!s || !s.revenueLastMonth.length) return 1;
    return Math.max(...s.revenueLastMonth.map(d => d.revenue), 1);
  });

  ordersPct(count: number): number {
    const s = this.stats();
    if (!s) return 0;
    const total = (s.draftOrders + s.confirmedOrders + s.cancelledOrders) || 1;
    return Math.round((count / total) * 100);
  }

  shipmentsPct(count: number): number {
    return Math.round((count / this.totalShipments()) * 100);
  }

  barHeight(revenue: number): number {
    const max = this.maxDailyRevenue();
    return Math.max(2, Math.round((revenue / max) * 100));
  }

  formatRevenue(amount: number): string {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
    return amount.toFixed(0);
  }

  ngOnInit(): void {
    this.merchantSvc.getAll().subscribe(d => this.merchants.set(d.length));
    this.productSvc.getAll().subscribe(d => this.products.set(d.length));
    this.clientSvc.getAll().subscribe(d => this.clients.set(d.length));
    this.riderSvc.getAll().subscribe(d => this.riders.set(d.length));

    if (this.auth.hasRole('ADMIN') || this.auth.hasRole('MANAGER')) {
      this.dashboardSvc.getStats().subscribe({
        next: data => {
          this.stats.set(data);
          // Sync simple counts from stats
          this.merchants.set(data.totalMerchants);
          this.products.set(data.totalProducts);
          this.clients.set(data.totalClients);
          this.riders.set(data.totalRiders);
          this.loadingStats.set(false);
        },
        error: () => this.loadingStats.set(false),
      });
    } else {
      this.loadingStats.set(false);
    }
  }
}
