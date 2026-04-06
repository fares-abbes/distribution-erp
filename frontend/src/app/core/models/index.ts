export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export type ShipmentStatus = 'READY_FOR_PICKUP' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
export type OrderPaymentMethod = 'PREPAID' | 'COD';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
export type PaymentStatus = 'PENDING' | 'PAID';
export type ReturnReason = 'REFUSED' | 'NOT_FOUND' | 'DAMAGED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';
export type UserRole = 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'RIDER' | 'MERCHANT' | 'WAREHOUSE';
export type ProductType = 'service' | 'article';

export interface Merchant {
  id: number;
  storeName: string;
  contactPerson?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  taxId?: string;
  websiteUrl?: string;
  commissionRate?: number;
  active: boolean;
}

export interface Client {
  id: number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  city?: string;
  landmark?: string;
  merchantId?: number;
  active: boolean;
}

export interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  type?: ProductType;
  purchasePrice?: number;
  salePrice?: number;
  weight?: number;
  volume?: number;
  dimensions?: string;
  stockQuantity: number;
  minStockLevel?: number;
  merchantId?: number;
  declaredValue?: number;
  fragile: boolean;
  active: boolean;
}

export interface Rider {
  id: number;
  name: string;
  phone: string;
  vehicleType?: string;
  active: boolean;
}

export interface Zone {
  id: number;
  name: string;
  cityOrRegion: string;
  baseDeliveryFee: number;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  active: boolean;
}

export interface StatusLog {
  id: number;
  timestamp: string;
  statusDescription: string;
  updatedBy: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  product: Product;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  codAmount?: number;
  clientId?: number;
  merchantId?: number;
  orderItems: OrderItem[];
}

export interface Shipment {
  id: number;
  trackingNumber: string;
  currentStatus: ShipmentStatus;
  pickupAddress?: string;
  deliveryAddress?: string;
  shippingCost?: number;
  orderId?: number;
  rider?: Rider;
  zone?: Zone;
  statusLogs: StatusLog[];
}

export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  merchantId?: number;
  orderId?: number;
}

export interface ReturnOrder {
  id: number;
  reason: ReturnReason;
  returnDate: string;
  restockApproved: boolean;
  shipmentId?: number;
  merchantId?: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  commissionAmount: number;
  status: InvoiceStatus;
  merchantId?: number;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  merchantRecordId?: number;
  active: boolean;
}
