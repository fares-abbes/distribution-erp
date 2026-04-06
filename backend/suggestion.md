# 🎯 Phase 1 Implementation Blueprint: Logistics & Order System

This document serves as the Technical Specification for implementing the core Order and Shipment functionality within the ERP. An LLM receiver should follow these instructions to ensure consistency with the existing Spring Boot codebase.

---

## 1. Project Context & Standards (For Implementer)
- **Tech Stack**: Spring Boot 3, Java 17+, JPA (MySQL), Hibernate, Keycloak Security.
- **Package Layout**:
    - Entities: `distribution.demo.Entities`
    - Repositories: `distribution.demo.Repositories`
    - Services: `distribution.demo.Services`
    - Controllers: `distribution.demo.Controllers`
    - Enums: `distribution.demo.Enums`
- **Identity Management**: Use `@JsonIdentityInfo` or `@JsonManagedReference`/`@JsonBackReference` on relationships to prevent infinite recursion during JSON serialization.

---

## 2. Updated Data Schema & Relationships

### 🚲 `Rider` (New Entity)
- Represents the courier/driver delivering the shipment.
- **Attributes**: `id`, `name`, `phone`, `vehicleType`, `active`.
- **Relationship**: `@OneToMany` Shipments.

### 📦 `Order` Entity
- **Attributes**: 
    - `String orderNumber` (Generated: "ORD-" + UUID or Timestamp).
    - `LocalDateTime orderDate`, `BigDecimal totalAmount`.
    - `@Enumerated(EnumType.STRING) OrderStatus status` (DRAFT, CONFIRMED, CANCELLED).
- **Core Relationships**: 
    - `@ManyToOne` Client (Buyer).
    - `@ManyToOne` Merchant (Source).
    - `@OneToMany` OrderItems (Items).
    - `@OneToOne(mappedBy = "order")` Shipment (Tracking).

### 🛒 `OrderItem` Entity
- **Attributes**: `Integer quantity`, `BigDecimal unitPrice` (Snapshot price), `BigDecimal discount`.
- **Relationship**: `@ManyToOne` Product, `@ManyToOne` Order.

### 🚚 `Shipment` (Logistics) Entity
- **Attributes**:
    - `String trackingNumber`.
    - `ShipmentStatus currentStatus` (PENDING -> IN_TRANSIT -> DELIVERED).
    - `String pickupAddress`, `String deliveryAddress`.
- **Relationships**: 
    - `@OneToOne` Order (Mapping reference).
    - `@ManyToOne` Rider (Who is shipping?).
    - `@OneToMany` statusLogs (Tracking history).

### 📜 `StatusLog` (Audit Trail)
- **Attributes**: `LocalDateTime timestamp`, `String statusDescription`, `String updatedBy`.
- **Relationship**: `@ManyToOne` Shipment.

---

## 3. Core Business Logic Requirements

### A. Atomic Stock Reservation (`OrderService.placeOrder`)
1. **Validation**: Check if all `OrderItem` quantities <= `Product.stockQuantity`.
2. **Transaction**: Method MUST be marked `@Transactional`.
3. **Execution**: Decrement `Product.stockQuantity`.
4. **Failure**: Throw a custom `InsufficientStockException` if validation fails.

### B. Shipping Calculation Logic
- Base Fee + (Total Weight * Rate) + (Fragile Surcharge).
- Multi-factor: `OrderItem.product.weight` and `OrderItem.product.isFragile`.

### C. Automatic Shipment Creation
- When an `Order` status transitions from **DRAFT** to **CONFIRMED**, the system must automatically instantiate a `Shipment` record with status `READY_FOR_PICKUP`.

---

## 4. API Endpoints (Controllers)

Implement the following RESTful routes:
- `POST /api/orders`: Submit a new order.
- `GET /api/orders/{id}`: Fetch detailed order status with items.
- `PATCH /api/orders/{id}/status`: Update order status (Security check: Only Merch/Admin).
- `PATCH /api/shipments/{id}/status`: Update tracking status (Security check: Only Rider/Admin).
- `GET /api/shipments/tracking/{trackingNumber}`: Public or restricted tracking info.

---

## 5. Security & Context
- Use `SecurityContextHolder` to resolve the current `User`.
- If a Merchant creates an order, verify the `merchant_id` matches the authenticated User's merchant profile.
- Restrict `Shipment` status updates to Users with `ROLE_RIDER` or `ROLE_ADMIN`.

---

## 6. Implementation Priorities (Sprint 1)
1.  **Enums & Entities**: Define `OrderStatus`, `ShipmentStatus`, `Order`, `OrderItem`, `Shipment`, `Rider`.
2.  **Repositories**: Basic CRUD interfaces for all above.
3.  **Service Component**: Create `OrderService` with the `@Transactional` logic for stock handling.
4.  **Security Integration**: Create `OrderController` and protect it with `@PreAuthorize`.

---

# 🚀 Phase 2 Blueprint: Operations, Finance & Reliability

> **Status of Phase 1**: Complete. All entities, CRUD, stock reservation, auto-shipment creation, and Keycloak security are implemented.

---

## 1. Immediate Hardening (Do This First)

These are not features — they are gaps that will cause production failures.

### A. Global Exception Handler
Create `@ControllerAdvice` class `GlobalExceptionHandler` that catches:
- `EntityNotFoundException` → `404 Not Found`
- `InsufficientStockException` → `409 Conflict`
- `IllegalArgumentException` → `400 Bad Request`
- `AccessDeniedException` → `403 Forbidden`
- `Exception` (fallback) → `500 Internal Server Error`

All responses should follow a standard envelope:
```json
{ "status": 400, "error": "Bad Request", "message": "..." }
```

### B. DTO Validation
Add `spring-boot-starter-validation` to `pom.xml`. Annotate all DTOs with Bean Validation constraints:
- `@NotBlank` on required strings (name, phone, email, sku, etc.)
- `@NotNull` on required IDs and enums
- `@Min(1)` on quantities and prices
- `@Email` on email fields
- Add `@Valid` to all `@RequestBody` parameters in every controller.

---

## 2. Phase 2 Entities & Schema

### 💰 `Payment` Entity
Tracks financial settlements between the company and its merchants.
- **Attributes**: `id`, `amount`, `paymentDate`, `method` (`CASH`, `BANK_TRANSFER`, `CHEQUE`), `reference`, `notes`, `status` (`PENDING`, `PAID`).
- **Relationship**: `@ManyToOne` Merchant.

### 🗺️ `Zone` Entity
Defines delivery coverage areas and their pricing rules.
- **Attributes**: `id`, `name`, `cityOrRegion`, `baseDeliveryFee`, `estimatedDaysMin`, `estimatedDaysMax`, `active`.
- **Relationship**: `@ManyToMany` Riders (which riders cover this zone).

### 🔄 `ReturnOrder` Entity
Handles parcels the client refused or could not receive.
- **Attributes**: `id`, `reason` (enum: `REFUSED`, `NOT_FOUND`, `DAMAGED`), `returnDate`, `restockApproved` (boolean).
- **Relationship**: `@OneToOne` Shipment, `@ManyToOne` Merchant.

### 🧾 `Invoice` Entity
A periodic billing document sent to the merchant.
- **Attributes**: `id`, `invoiceNumber`, `issueDate`, `dueDate`, `totalAmount`, `commissionAmount`, `status` (`DRAFT`, `SENT`, `PAID`).
- **Relationship**: `@ManyToOne` Merchant, `@OneToMany` Orders (the orders covered in this invoice period).

---

## 3. Phase 2 Business Logic

### A. Rider Assignment (`ShipmentService.assignRider`)
- Endpoint: `PATCH /api/shipments/{id}/assign-rider`
- Security: `ROLE_DISPATCHER` or `ROLE_ADMIN`.
- Logic: Set `shipment.rider`, transition status from `READY_FOR_PICKUP` → `PENDING`, add a `StatusLog` entry.

### B. Cash on Delivery (COD)
- Add `paymentMethod` (enum: `PREPAID`, `COD`) and `codAmount` (`BigDecimal`) to the `Order` entity.
- When a `Shipment` is marked `DELIVERED` and `order.paymentMethod == COD`, create a pending `Payment` record for the merchant automatically.


### C. Zone-Based Delivery Fee Override
- Add `@ManyToOne Zone` to the `Shipment` entity.
- In `OrderService.createShipmentForOrder`, look up the Zone by the delivery address city.
- If a matching Zone exists, use `zone.baseDeliveryFee` instead of the hardcoded `BASE_FEE = 5.0`.

### D. Return Flow (`ReturnService.processReturn`)
- Endpoint: `POST /api/returns`
- Security: `ROLE_DISPATCHER` or `ROLE_ADMIN`.
- Logic:
    1. Find the `Shipment` by id.
    2. Update `shipment.currentStatus` to a new enum value `RETURNED`.
    3. Create a `ReturnOrder` record linked to the shipment.
    4. If `restockApproved == true`, restore `Product.stockQuantity` for each `OrderItem`.

### E. Invoice Generation (`InvoiceService.generateInvoice`)
- Endpoint: `POST /api/invoices/generate?merchantId={id}&from={date}&to={date}`
- Security: `ROLE_ADMIN` or `ROLE_MANAGER`.
- Logic:
    1. Fetch all `CONFIRMED` or `DELIVERED` orders for the merchant in the date range.
    2. Calculate `totalAmount` (sum of order totals) and `commissionAmount` (totalAmount × merchant.commissionRate).
    3. Save and return the `Invoice`.

---

## 4. Phase 2 API Endpoints

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| PATCH | `/api/shipments/{id}/assign-rider` | DISPATCHER, ADMIN | Assign rider to shipment |
| POST | `/api/returns` | DISPATCHER, ADMIN | Register a return |
| GET | `/api/returns/{id}` | ADMIN, MANAGER | Get return details |
| GET | `/api/zones` | ADMIN, MANAGER, DISPATCHER | List delivery zones |
| POST | `/api/zones` | ADMIN, MANAGER | Create a zone |
| PUT | `/api/zones/{id}` | ADMIN, MANAGER | Update a zone |
| POST | `/api/invoices/generate` | ADMIN, MANAGER | Generate merchant invoice |
| GET | `/api/invoices/{id}` | ADMIN, MANAGER, MERCHANT | View invoice |
| GET | `/api/invoices/merchant/{id}` | ADMIN, MANAGER, MERCHANT | List invoices for merchant |
| GET | `/api/payments/merchant/{id}` | ADMIN, MANAGER | Payment history for merchant |

---

## 5. Phase 3 Preview: Reporting & Visibility

To be designed in detail after Phase 2 is complete. High-level scope:

- **`GET /api/reports/dashboard`** — Daily KPIs: total orders, delivered today, pending shipments, COD collected.
- **`GET /api/reports/rider/{id}/performance`** — Delivery success rate, average time per delivery for a given rider.
- **`GET /api/reports/merchant/{id}/summary`** — Orders count, revenue, pending collections, commission owed.
- **`GET /api/reports/stock/low`** — All products where `stockQuantity <= minStockLevel`.

---

## 6. Implementation Priorities (Sprint 2)

1. **Exception Handler & Validation** — `GlobalExceptionHandler` + `@Valid` on all DTOs. Zero production risk if done first.
2. **COD Fields on Order** — Small schema change, high operational value.
3. **Zone Entity + CRUD** — Needed before rider assignment makes business sense.
4. **Rider Assignment endpoint** — Core dispatch workflow.
5. **Return Flow** — Needed for complete delivery lifecycle.
6. **Invoice Generation** — Enables merchant billing and financial reconciliation.
