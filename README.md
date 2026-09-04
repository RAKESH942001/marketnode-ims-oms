# MarketNode OMS & IMS Platform

This repository implements the **Order Management System (OMS)** on top of the existing **Inventory Management System (IMS)** for MarketNode, conforming to the functional specifications and business rules outlined in [`PRODUCT.md`](PRODUCT.md).

Both systems share a single product catalog and PostgreSQL database. The IMS serves as the internal system of record for catalog and inventory management, while the OMS provides customer-facing storefront browsing, order placement, order history, and order cancellation with automated inventory reconciliation.

---

## Architecture Overview

```text
                      ┌─────────────────────────────────┐
                      │          React 18 + TS          │
                      │   - IMS: Admin & Inventory     │
                      │   - OMS: Storefront & Orders    │
                      └────────────────┬────────────────┘
                                       │ REST / JSON
                                       ▼
                      ┌─────────────────────────────────┐
                      │       Spring Boot 3 (API)       │
                      │  - DTOs & Bean Validation       │
                      │  - Transaction Boundary         │
                      │  - Global Exception Handler     │
                      └────────────────┬────────────────┘
                                       │ JPA / SQL
                                       ▼
                      ┌─────────────────────────────────┐
                      │       PostgreSQL Database       │
                      │  - products (Row-level lock)    │
                      │  - orders (Indexed by user_id)  │
                      └─────────────────────────────────┘
```

### Key Engineering Decisions

* **Concurrency-Safe Stock Deduction**: Rather than relying on application-level read-then-write checks, inventory deduction executes via an atomic conditional SQL update:
  ```sql
  UPDATE product_entitiy
  SET stock = stock - :quantity
  WHERE id = :productId AND stock >= :quantity
  ```
  The affected-row count (`1` = success, `0` = insufficient stock) acts as the invariant check, preventing overselling race conditions under concurrent requests without requiring application-level locks.
* **Transactional Integrity**: Order placement and cancellation workflows are annotated with `@Transactional`. When placing an order, inventory deduction and order entity creation occur within the same atomic transaction boundary. If any step fails, changes roll back cleanly.
* **Monetary Precision**: All monetary values use `BigDecimal` to avoid binary floating-point precision issues in currency calculations.
* **Immutable Order Snapshots**: Orders capture `productName`, `unitPrice`, `quantity`, and `totalAmount` at purchase time. Subsequent edits to the product catalog do not mutate historical order records.
* **Resilience to Catalog Deletions**: The `productId` reference in `orders` is nullable. If a product is later deleted from the active catalog, historical order records remain fully queryable and intact.
* **Information Hiding (Storefront vs. Admin)**: The public storefront API (`/api/store/products`) maps products through `StoreProductResponse` DTOs, exposing only an `inStock` boolean indicator (`stock > 0`) without leaking internal warehouse stock quantities.
* **Request Validation**: Incoming requests are validated at the controller boundary using Bean Validation (`@NotNull`, `@Min(1)`, `@Max(999)`), preventing invalid payloads from reaching the domain layer.
* **Consistent Error Contract**: All exceptions (`InsufficientStockException`, `ResourceNotFoundException`, validation failures) map through a centralized `@ControllerAdvice` handler returning a structured `ApiErrorResponse` (`timestamp`, `status`, `error`, `message`, `path`).

---

## API Endpoints

### Storefront (OMS)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/store/products` | Browse available catalog items (returns `inStock` flag) |
| `GET` | `/api/store/products/{id}` | Retrieve individual product storefront details |
| `POST` | `/api/orders` | Place an order (`userId`, `productId`, `quantity`) |
| `GET` | `/api/orders?userId={id}` | Retrieve order history for a specific customer |
| `GET` | `/api/orders/{id}` | Retrieve order summary and status snapshot |
| `POST` | `/api/orders/{id}/cancel` | Cancel an order and restore reserved stock |

### Catalog & Inventory (IMS)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all inventory items with exact stock counts |
| `GET` | `/api/products/{id}` | Get inventory item details |
| `POST` | `/api/products` | Create a new product (defaults to 0 stock) |
| `PUT` | `/api/products/{id}` | Update product metadata (name, description, category, price) |
| `DELETE` | `/api/products/{id}` | Delete product from catalog |
| `POST` | `/api/products/{id}/stock` | Adjust stock level (`amount` can be positive or negative) |

---

## Concurrency Scenario: Preventing Overselling

Consider the following concurrent race condition:

```text
Initial Stock = 5

Customer A requests: quantity = 4
Customer B requests: quantity = 4

Both HTTP requests arrive at the server simultaneously.
```

1. **Without atomic conditional update**: Both requests read `stock = 5`, pass the in-memory validation check (`5 >= 4`), and write back `stock = 1` and `stock = -3`, causing overselling.
2. **With our atomic conditional update**:
   ```sql
   UPDATE product_entitiy SET stock = stock - 4 WHERE id = :id AND stock >= 4
   ```
   PostgreSQL applies row-level locking during the update. Exactly one transaction succeeds (returns `1` row updated). The second transaction finds `stock = 1`, fails the `stock >= 4` predicate (returns `0` rows updated), and triggers an `InsufficientStockException`.
   * **Customer A**: Order `CREATED` (status `201`).
   * **Customer B**: Rejected with `400 Bad Request` (`Insufficient stock`).
   * **Final Stock**: `1` (consistent and non-negative).

---

## Order Lifecycle

```text
       [ Customer Places Order ]
                  │
                  ▼
          Stock >= Quantity?
             /          \
           Yes           No
           /              \
     [ CREATED ]     [ Rejected: 400 Bad Request ]
          │
  [ Customer Cancels ]
          │
          ▼
    Status == CREATED?
       /          \
     Yes           No
     /              \
[ CANCELLED ]    [ Rejected: 400 Bad Request ]
(Stock Restored)   (Cannot cancel already cancelled order)
```

---

## Automated Tests

Unit tests in `backend/src/test/java/com/example/inventorymngt/service/OrderServiceTest.java` test core business rules:

* `testPlaceOrder_Success`: Verifies stock deduction and immutable snapshot persistence.
* `testPlaceOrder_InsufficientStock_ThrowsException`: Verifies rejection when requested > available, confirming no order is persisted.
* `testPlaceOrder_ProductNotFound`: Verifies 404 response on non-existent catalog ID.
* `testCancelOrder_Success`: Verifies transition to `CANCELLED` and stock restoration.
* `testCancelOrder_DoubleCancellation_ThrowsException`: Prevents duplicate stock restoration on already cancelled orders.
* `testHistoricalPriceIntegrity`: Verifies that price updates in the product catalog do not affect prior orders.

Run backend tests:
```bash
cd backend
mvn test
```

---

## Running the Application

### 1. Run with Docker Compose (Recommended)
From the repository root:
```bash
docker-compose up --build
```
This starts PostgreSQL (port `5432`) and the Spring Boot backend (port `8080`).

### 2. Run Locally

**Prerequisites**: Java 17+, Node.js 18+, PostgreSQL.

* **Backend**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
  API runs on `http://localhost:8080`.

* **Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  App opens on `http://localhost:5173`.

---

## Authentication Scope & Production Evolution

* **Current Implementation**: Per `PRODUCT.md`, authentication is out of scope. The customer context (`userId`) is supplied via request parameters/body, and the UI provides a user switcher in the navigation bar to test multi-user order isolation.
* **Production Recommendation**:
  1. Extract `userId` from the verified security context (e.g., JWT token claims) rather than trusting client-supplied identifiers.
  2. Implement an `Idempotency-Key` header on `POST /api/orders` to guard against duplicate submissions during network retries.
  3. Implement offset/keyset pagination (`Pageable`) on `GET /api/orders` as order history grows.
