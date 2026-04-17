import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'merchants', loadComponent: () => import('./pages/merchants/merchants').then(m => m.MerchantsComponent) },
      { path: 'clients', loadComponent: () => import('./pages/clients/clients').then(m => m.ClientsComponent) },
      { path: 'products', loadComponent: () => import('./pages/products/products').then(m => m.ProductsComponent) },
      { path: 'riders', loadComponent: () => import('./pages/riders/riders').then(m => m.RidersComponent) },
      { path: 'vehicles', loadComponent: () => import('./pages/vehicles/vehicles').then(m => m.VehiclesComponent) },
      { path: 'zones', loadComponent: () => import('./pages/zones/zones').then(m => m.ZonesComponent) },
      { path: 'orders', loadComponent: () => import('./pages/orders/orders').then(m => m.OrdersComponent) },
      { path: 'shipments', loadComponent: () => import('./pages/shipments/shipments').then(m => m.ShipmentsComponent) },
      { path: 'payments', loadComponent: () => import('./pages/payments/payments').then(m => m.PaymentsComponent) },
      { path: 'returns', loadComponent: () => import('./pages/returns/returns').then(m => m.ReturnsComponent) },
      { path: 'invoices', loadComponent: () => import('./pages/invoices/invoices').then(m => m.InvoicesComponent) },
      { path: 'warehouses', loadComponent: () => import('./pages/warehouses/warehouses').then(m => m.WarehousesComponent) },
      { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
