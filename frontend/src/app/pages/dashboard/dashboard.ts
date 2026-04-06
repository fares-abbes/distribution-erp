import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MerchantService } from '../../core/services/merchant.service';
import { ProductService } from '../../core/services/product.service';
import { ClientService } from '../../core/services/client.service';
import { RiderService } from '../../core/services/rider.service';
import { OrderService } from '../../core/services/order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private merchantSvc = inject(MerchantService);
  private productSvc = inject(ProductService);
  private clientSvc = inject(ClientService);
  private riderSvc = inject(RiderService);
  private orderSvc = inject(OrderService);

  merchants = signal(0);
  products = signal(0);
  clients = signal(0);
  riders = signal(0);
  orders = signal(0);

  ngOnInit(): void {
    this.merchantSvc.getAll().subscribe(d => this.merchants.set(d.length));
    this.productSvc.getAll().subscribe(d => this.products.set(d.length));
    this.clientSvc.getAll().subscribe(d => this.clients.set(d.length));
    this.riderSvc.getAll().subscribe(d => this.riders.set(d.length));
    if (this.auth.hasRole('ADMIN') || this.auth.hasRole('MANAGER')) {
      this.orderSvc.getAll().subscribe(d => this.orders.set(d.length));
    }
  }
}
