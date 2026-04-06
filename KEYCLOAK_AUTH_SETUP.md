# Keycloak Authentication Setup Guide

This document explains how the authentication is wired in this project and the exact steps needed to get it fully working.

---

## How It Works (Big Picture)

```
Client (Postman / Frontend)
        |
        | 1. POST /token  →  Keycloak (port 8095)
        |                    returns JWT access_token
        |
        | 2. GET /api/products  →  Spring Boot (port 9090)
        |    Authorization: Bearer <token>
        |
        |    Spring validates token signature using Keycloak's public keys
        |    Spring reads roles from token → enforces @PreAuthorize rules
```

Your Spring Boot app is an **OAuth2 Resource Server**. It never handles login itself — it only validates tokens issued by Keycloak.

---

## What Is Already Configured

### `application.properties`
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8095/realms/demo-realm
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8095/realms/demo-realm/protocol/openid-connect/certs
```

- **issuer-uri**: Spring Boot fetches Keycloak metadata from this URL on startup to validate tokens.
- **jwk-set-uri**: Public keys used to verify JWT signatures.

### `SecurityConfig.java`
- All endpoints require a valid JWT token (`anyRequest().authenticated()`).
- Uses a custom `KeycloakRoleConverter` that reads roles from the `realm_access.roles` claim inside the JWT and maps them to Spring Security roles prefixed with `ROLE_`.
- `@EnableMethodSecurity` activates `@PreAuthorize` on controllers.

### `ProductController.java`
Roles enforced per operation:
| Operation | Allowed Roles |
|-----------|--------------|
| GET | ADMIN, MANAGER, MERCHANT, WAREHOUSE |
| POST / PUT / DELETE | ADMIN, MANAGER |

---

## Step-by-Step Keycloak Setup

### Step 1 — Install & Start Keycloak

Download Keycloak 24+ from the official site and start it:

```bash
# Development mode (H2 in-memory DB, admin console enabled)
./bin/kc.sh start-dev --http-port=8095

# Windows
bin\kc.bat start-dev --http-port=8095
```

First run creates an admin account — set it up at `http://localhost:8095`.

---

### Step 2 — Create the Realm

1. Open `http://localhost:8095/admin`
2. Click the dropdown at the top-left (shows "Keycloak") → **Create Realm**
3. Set **Realm name**: `demo-realm`
4. Click **Create**

> This matches the realm name in `application.properties`.

---

### Step 3 — Create Roles

These must exactly match the `UserRole` enum values in the project.

1. In `demo-realm` → go to **Realm roles** (left sidebar)
2. Click **Create role** and add each of these:

| Role Name |
|-----------|
| `ADMIN` |
| `MANAGER` |
| `DISPATCHER` |
| `RIDER` |
| `MERCHANT` |
| `WAREHOUSE` |

---

### Step 4 — Create a Client (for your frontend/API consumer)

1. Go to **Clients** → **Create client**
2. Fill in:
   - **Client ID**: `distribution-app` (or any name you want)
   - **Client type**: `OpenID Connect`
3. Click **Next**
4. Enable **Client authentication**: OFF (public client for now, or ON for confidential)
5. Enable **Direct access grants**: ON (allows username/password token requests — useful for testing)
6. Click **Save**

> If you are building a frontend (React, etc.), also set **Valid redirect URIs** to your frontend URL, e.g., `http://localhost:3000/*`.

---

### Step 5 — Create Users

1. Go to **Users** → **Create new user**
2. Fill in **Username** and click **Create**
3. Go to the **Credentials** tab → Set a password (disable "Temporary")
4. Go to the **Role mapping** tab → **Assign role** → select the appropriate role (e.g., `ADMIN`)

Repeat for each user/role you need to test.

---

### Step 6 — Test Token Acquisition

Use Postman or curl to get a token:

```bash
curl -X POST http://localhost:8095/realms/demo-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=distribution-app" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD"
```

You will receive a response like:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

Copy the `access_token`.

---

### Step 7 — Call the Spring Boot API

```bash
curl -X GET http://localhost:9090/api/products \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## Verifying the JWT Contains the Roles

Paste your `access_token` into [jwt.io](https://jwt.io) and look for this claim in the payload:

```json
{
  "realm_access": {
    "roles": ["ADMIN", "default-roles-demo-realm", "offline_access"]
  }
}
```

The `KeycloakRoleConverter` reads `realm_access.roles`, so your assigned role **must appear there**. If it doesn't, the user was not assigned a realm role (not a client role).

---

## What Remains To Be Done

### 1. Exception Handling (Important)
Right now, if a token is invalid or a user hits a forbidden endpoint, Spring returns a generic error. Add a `@RestControllerAdvice` to return clean JSON errors:

```java
// Handle 403 Forbidden and 401 Unauthorized properly
// Handle EntityNotFoundException from ProductService
// Handle IllegalArgumentException (duplicate SKU)
```

### 2. Input Validation
Add `@Valid` + Jakarta Bean Validation annotations to `ProductDto` so the API rejects bad input before hitting the service:

```java
@NotBlank
private String sku;

@NotBlank
private String name;

@NotNull
@Positive
private BigDecimal salePrice;
```

Then add `@Valid` to controller method parameters:
```java
public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductDto dto)
```

### 3. Token Expiry / Refresh
Access tokens expire in 5 minutes by default. Your frontend will need to use the `refresh_token` to get new access tokens silently. Configure this in Keycloak under the client's **Token** settings.

### 4. CORS Configuration (If Using a Frontend)
Add CORS configuration to `SecurityConfig` to allow your frontend origin:

```java
http.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}));
```

### 5. Production Keycloak Deployment
For production, do **not** use `start-dev`. Use:

```bash
./bin/kc.sh start \
  --db=postgres \
  --db-url=jdbc:postgresql://db:5432/keycloak \
  --db-username=keycloak \
  --db-password=secret \
  --hostname=auth.yourdomain.com \
  --https-certificate-file=/path/to/cert.pem \
  --https-certificate-key-file=/path/to/key.pem
```

Update `application.properties` to point to the production URL:
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://auth.yourdomain.com/realms/demo-realm
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://auth.yourdomain.com/realms/demo-realm/protocol/openid-connect/certs
```

### 6. MERCHANT Role Scoping (Recommended)
Currently a `MERCHANT` user can call `GET /api/products` and see **all** products. You should filter results so a merchant only sees their own products. This requires reading the merchant's ID from the JWT token in the controller.

---

## Quick Reference

| What | Where |
|------|-------|
| Keycloak Admin Console | `http://localhost:8095/admin` |
| Token endpoint | `http://localhost:8095/realms/demo-realm/protocol/openid-connect/token` |
| Spring Boot API | `http://localhost:9090` |
| Realm name | `demo-realm` |
| Client ID | `distribution-app` |
| Role source in JWT | `realm_access.roles` |
