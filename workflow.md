# DistribERP — Testing Workflows

## Prerequisites — Start Everything

```bash
# 1. Keycloak (must be first)
#    Start Keycloak on port 8095
#    Ensure realm "demo-realm" and client "distribution-app" exist

# 2. Backend
cd demo
./mvnw spring-boot:run
# Runs on http://localhost:9090

# 3. Frontend
cd frontend
npm install
ng serve
# Runs on http://localhost:4200
```

---

## How Keycloak Users Work

Every person who logs in must exist in Keycloak **and** have a realm role assigned there.
The frontend reads those roles and shows/hides menu items accordingly.

To create a test user in Keycloak:
1. Open `http://localhost:8095` → Administration Console
2. Select realm `demo-realm`
3. **Users → Add user** → set username, save
4. Tab **Credentials** → set a password (disable "Temporary")
5. Tab **Role mapping** → assign a realm role: `ADMIN`, `MANAGER`, `DISPATCHER`, `RIDER`, `MERCHANT`, or `WAREHOUSE`

Create at least one **ADMIN** user before doing anything else.

---

## 1. First Login

**Who:** ADMIN user created in Keycloak

1. Open `http://localhost:4200`
2. You are redirected to the Keycloak login page
3. Enter your ADMIN credentials → click **Sign In**
4. Redirected back to `http://localhost:4200/dashboard`
5. Sidebar shows all menu items; top-right shows your role badge

---

## 2. Master Data Setup

Do these steps **in order** — each one depends on the previous.
All require being logged in as **ADMIN** or **MANAGER**.

---

### 2a. Create a Merchant

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/merchants`

1. Log in as ADMIN → you are on `/dashboard`
2. Click **Merchants** in the left sidebar → you land on `/merchants`
3. Click **New Merchant** (top-right button)
4. Fill the form:

| Field | Example |
|-------|---------|
| Store Name | `TechStore` |
| Email | `tech@store.com` |
| Contact Person | `Ali Hassan` |
| Phone | `+212600000000` |
| Address | `10 Bd Mohammed V, Casablanca` |
| Commission Rate (%) | `5` |

5. Click **Save**

→ `TechStore` appears in the table with status **ACTIVE**

---

### 2b. Create a Zone

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/zones`

Zones determine automatic shipping costs. The zone matches on the **Client's city** field.

1. Sidebar → **Zones** → `/zones`
2. Click **New Zone**
3. Fill the form:

| Field | Example |
|-------|---------|
| Zone Name | `North` |
| City / Region | `Casablanca` ← must exactly match Client's city later |
| Base Delivery Fee | `15.00` |
| Min Days | `1` |
| Max Days | `3` |

4. Click **Save**

---

### 2c. Create a Rider

**Who:** ADMIN, MANAGER, or DISPATCHER  
**URL:** `http://localhost:4200/riders`

1. Sidebar → **Riders** → `/riders`
2. Click **New Rider**
3. Fill the form:

| Field | Example |
|-------|---------|
| Name | `Karim Bel` |
| Phone | `+212600000001` |
| Vehicle Type | `MOTORCYCLE` |

4. Click **Save**

---

### 2d. Create a Client

**Who:** ADMIN, MANAGER, or MERCHANT  
**URL:** `http://localhost:4200/clients`

> The client's **City** must match a Zone's **City / Region** for automatic shipping cost to apply.

1. Sidebar → **Clients** → `/clients`
2. Click **New Client**
3. Fill the form:

| Field | Example |
|-------|---------|
| Full Name | `Sara Amrani` |
| Phone | `+212600000002` |
| City | `Casablanca` ← same spelling as the zone created in 2b |
| Address | `12 Rue Hassan II, Casablanca` |
| Merchant | `TechStore` ← select from dropdown |

4. Click **Save**

---

### 2e. Create a Product

**Who:** ADMIN, MANAGER, MERCHANT, or WAREHOUSE  
**URL:** `http://localhost:4200/products`

1. Sidebar → **Products** → `/products`
2. Click **New Product**
3. Fill the form:

| Field | Example |
|-------|---------|
| Name | `Wireless Mouse` |
| SKU | `WM-001` |
| Sale Price | `150.00` |
| Purchase Price | `80.00` |
| Stock | `50` |
| Weight (kg) | `0.3` |
| Merchant | `TechStore` ← select from dropdown |
| Fragile | unchecked |

4. Click **Save**

→ Product appears with stock **50**. Stock is decremented automatically when an order is confirmed.

---

## 3. Order Lifecycle (Core Workflow)

**Full flow:** Place Order → Confirm → Shipment auto-created → Assign Rider → Deliver → (COD: auto-payment)

---

### Step 1 — Place an Order

**Who:** ADMIN, MANAGER, or MERCHANT  
**URL:** `http://localhost:4200/orders`

1. Sidebar → **Orders** → `/orders`
2. Click **Place Order**
3. Fill the form:
   - **Client**: `Sara Amrani`
   - **Merchant**: `TechStore`
   - **Payment Method**: `COD` (for this walkthrough)
   - **COD Amount**: `300.00`
4. Under **Order Items**:
   - Select product: `Wireless Mouse`
   - Quantity: `2`
   - Unit Price: auto-filled as `150.00` (from product's sale price)
   - Discount: `0`
5. Click **Place Order**

→ Order appears in the table with status **DRAFT**  
→ Go to `/products` → `Wireless Mouse` stock is now **48** (50 − 2)

---

### Step 2 — Confirm the Order

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/orders`

1. Find the DRAFT order in the table
2. Click **Update Status** (the button only shows on DRAFT orders)
3. Select `CONFIRMED` → click **Update**

→ Order status → **CONFIRMED**  
→ A **Shipment** is automatically created in the background  
→ Go to `http://localhost:4200/shipments` to see it  
→ Shipping cost = `zone.baseDeliveryFee + (weight × qty × 0.5)`  
  = `15 + (0.3 × 2 × 0.5)` = **15.30**

---

### Step 3 — Assign a Rider

**Who:** ADMIN, MANAGER, or DISPATCHER  
**URL:** `http://localhost:4200/shipments`

1. Sidebar → **Shipments** → `/shipments`
2. Find the shipment with status **READY\_FOR\_PICKUP**
3. Click **Rider** button on that row
4. Select `Karim Bel` from the dropdown → click **Assign**

→ Shipment status → **PENDING**  
→ Click **Logs** on that row to confirm a log entry was added

---

### Step 4 — Advance Shipment Status

**Who:** ADMIN, MANAGER, or DISPATCHER  
**URL:** `http://localhost:4200/shipments`

Click **Status** on the shipment row and advance one step at a time:

```
READY_FOR_PICKUP  →  PENDING  →  IN_TRANSIT  →  DELIVERED
```

Each transition adds a new entry visible in **Logs**.

---

### Step 5 — COD Auto-Payment (only for COD orders)

After setting status to **DELIVERED**:

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/payments`

1. Sidebar → **Payments** → `/payments`
2. Click the **TechStore** tab
3. A new payment appears automatically: amount `300.00`, method `CASH`, status **PENDING**
4. Click **Mark Paid** to confirm the rider handed over the cash

---

## 4. Cancel an Order

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/orders`

1. Sidebar → **Orders** → `/orders`
2. Find a **DRAFT** order → click **Update Status** → select `CANCELLED` → **Update**

→ Order status → **CANCELLED**  
→ Go to `/products` → `Wireless Mouse` stock is restored back to `50`

---

## 5. Register a Return

Use this when a delivered package is sent back by the client.

**Who:** ADMIN, MANAGER, DISPATCHER, or MERCHANT  
**URL:** `http://localhost:4200/returns`

1. First, note the **ID** of a DELIVERED shipment from `/shipments`
2. Sidebar → **Returns** → `/returns`
3. Click **Register Return**
4. Fill the form:

| Field | Example |
|-------|---------|
| Shipment ID | `3` ← the ID from `/shipments` table |
| Merchant | `TechStore` |
| Reason | `REFUSED` |
| Approve Restock | checked |

5. Click **Register**

→ That shipment's status → **RETURNED**  
→ If restock was checked: product stock is restored for every item in that order

---

## 6. Manual Payment

Use this to record a bank transfer or cheque payment not tied to a delivery.

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/payments`

1. Sidebar → **Payments** → `/payments`
2. Click the **TechStore** tab to see existing payments
3. Click **Record Payment**
4. Fill the form:

| Field | Example |
|-------|---------|
| Amount | `500.00` |
| Method | `BANK_TRANSFER` |
| Merchant | `TechStore` |
| Reference | `TRF-2024-001` |
| Status | `PENDING` |

5. Click **Save**
6. When bank confirms → click **Mark Paid** on that row

---

## 7. Generate an Invoice

Invoices compute how much a merchant owes in commission for a given date range.

**Who:** ADMIN or MANAGER  
**URL:** `http://localhost:4200/invoices`

1. Sidebar → **Invoices** → `/invoices`
2. Click the **TechStore** tab (shows existing invoices for that merchant)
3. Click **Generate Invoice**
4. Fill the form:

| Field | Example |
|-------|---------|
| Merchant | `TechStore` |
| From Date | `2024-01-01` |
| To Date | `2024-12-31` |

5. Click **Generate**

→ Invoice appears with:
- `totalAmount` = sum of CONFIRMED order totals in range
- `commissionAmount` = totalAmount × 5% (merchant's commission rate)
- Status: **DRAFT**

6. Advance status inline: click **→ SENT** then **→ PAID**

---

## 8. Manage Users

**Who:** ADMIN only  
**URL:** `http://localhost:4200/users`

> This page manages users in the **local database** (for app-level data like merchant linkage).
> To allow someone to **log in**, you must also create them in Keycloak (see top of this file).

1. Sidebar → **Users** → `/users` (only visible to ADMIN)
2. Click **New User**

| Field | Example |
|-------|---------|
| Username | `dispatcher1` |
| Email | `disp@erp.com` |
| Password | `secret123` |
| Role | `DISPATCHER` |

3. Click **Save**
4. Then go to Keycloak → create the same username → assign realm role `DISPATCHER`

Now `dispatcher1` can log in and will see only: Shipments, Riders, Zones, Orders (view), Returns.

---

## 9. Full End-to-End Checklist

Follow these steps top to bottom on a fresh database:

```
[ ] Log in as ADMIN at http://localhost:4200

[ ] Go to /merchants → create TechStore (commission 5%)
[ ] Go to /zones     → create North zone (Casablanca, fee=15)
[ ] Go to /riders    → create Karim Bel (MOTORCYCLE)
[ ] Go to /clients   → create Sara Amrani (city=Casablanca, merchant=TechStore)
[ ] Go to /products  → create Wireless Mouse (stock=50, price=150, merchant=TechStore)

[ ] Go to /orders    → place COD order (Sara, TechStore, 2× Wireless Mouse, COD=300)
[ ] Go to /products  → verify Wireless Mouse stock = 48

[ ] Go to /orders    → confirm the order (DRAFT → CONFIRMED)
[ ] Go to /shipments → verify shipment exists, cost = 15.30, status = READY_FOR_PICKUP

[ ] Go to /shipments → assign Karim Bel as rider
[ ] Go to /shipments → set status → IN_TRANSIT
[ ] Go to /shipments → set status → DELIVERED

[ ] Go to /payments  → TechStore tab → verify PENDING CASH 300 auto-created
[ ] Go to /payments  → click Mark Paid on that row

[ ] Go to /invoices  → generate invoice for TechStore (full year)
[ ] Verify commissionAmount = totalAmount × 5%
[ ] Advance invoice: DRAFT → SENT → PAID

[ ] Go to /returns   → register return (use a shipment ID, REFUSED, restock=true)
[ ] Go to /products  → verify stock restored

[ ] Go to /orders    → create a new DRAFT order → cancel it → verify stock restored
```

---

## Roles & Pages Quick Reference

| Role | Visible Pages |
|------|--------------|
| ADMIN | Dashboard, Orders, Shipments, Products, Clients, Merchants, Riders, Zones, Payments, Returns, Invoices, Users |
| MANAGER | Same as ADMIN minus Users |
| DISPATCHER | Dashboard, Orders (view), Shipments, Riders, Zones, Returns |
| RIDER | Dashboard, Shipments (own) |
| MERCHANT | Dashboard, Orders, Products, Clients, Returns, Invoices, Payments |
| WAREHOUSE | Dashboard, Products |

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Redirected to Keycloak but can't log in | User doesn't exist in Keycloak | Add user + assign realm role in Keycloak admin |
| Page shows 401 / data won't load | Token expired | Log out and log back in |
| 409 error when confirming order | Insufficient stock | Go to `/products`, edit the product, increase stock |
| Shipment not created after confirming | Backend error in `createShipmentForOrder` | Check backend console logs |
| Shipping cost shows `5.00` (flat) | Client's city doesn't match any Zone | Go to `/zones`, check the `cityOrRegion` spelling matches the client's `city` exactly |
| COD payment not auto-created | Status wasn't set to exactly `DELIVERED` | Make sure you select DELIVERED, not a different status |
| Sidebar item missing | Your role doesn't have access | Log in with a higher-privilege role (ADMIN/MANAGER) |
