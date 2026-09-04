# System Design & Architectural Decisions

This document details the engineering trade-offs, concurrency strategies, and design decisions implemented in the MarketNode Order Management System (OMS) and Inventory Management System (IMS).

---

## 1. Concurrency Control: Atomic Conditional Update vs. Locking

### The Problem
When multiple users simultaneously attempt to order items with limited remaining inventory, concurrent reads can result in a classic check-then-act race condition, leading to negative inventory (overselling).

### Approaches Evaluated

| Approach | Mechanism | Trade-Offs |
|---|---|---|
| **Pessimistic Locking (`SELECT FOR UPDATE`)** | Explicitly locks product row upon read until transaction commits. | Prevents concurrency issues, but holds database locks across read + processing duration, increasing lock contention on popular items. |
| **Optimistic Locking (`@Version`)** | Validates record version on commit; throws `OptimisticLockException` on concurrent modification. | Non-blocking, but requires application-level retry loops that degrade throughput under high contention. |
| **Atomic Conditional Update (Chosen)** | `UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty` | Single atomic round-trip. Relies on the database's native row-level write lock. Returns affected row count (`1` = success, `0` = insufficient stock) without long lock hold times or retry loops. |

### Decision
We implemented the **atomic conditional update** in `ProductRepo.java` (`deductStockIfAvailable`). This provides deterministic, race-condition-free stock deduction with minimal lock duration and zero retry complexity.

---

## 2. Consistency Boundaries: PostgreSQL Transactions vs. Kafka

### Why not Event-Driven Architecture / Kafka for Order Placement?
In e-commerce systems, an order cannot be confirmed if the inventory reservation fails. Stock deduction and order placement share a **strong consistency boundary**:
```text
Order Placement
  ├── Deduct Inventory
  └── Persist Order Record
```

Introducing an asynchronous message broker (e.g., Kafka) at this boundary would convert a synchronous invariant into an eventually consistent distributed transaction. This introduces significant operational complexity:
1. **Compensating Transactions (Saga pattern)**: Handling cases where the order service creates an order, but the inventory consumer later rejects the deduction.
2. **Transactional Outbox**: Ensuring events are reliably published to Kafka if the database transaction commits.
3. **Reconciliation & Idempotency**: Handling duplicate messages, out-of-order deliveries, and consumer downtime.

### Decision
For the scope of this platform, order placement and stock deduction remain **synchronous and wrapped in a single database transaction (`@Transactional`)**. 

**Where Kafka would be introduced in production**: Asynchronous downstream workflows that do not affect the immediate order acceptance invariant, such as order confirmation emails, analytics events, and warehouse fulfillment dispatch.

---

## 3. Historical Data Preservation & Catalog Deletion

### The Problem
Products in an active catalog may have their prices adjusted, names changed, or be completely deleted by IMS administrators. Historical customer orders must remain accurate and immutable regardless of future catalog changes.

### Decision
1. **Snapshotting**: The `orders` entity records `productName`, `unitPrice`, and computed `totalAmount` at the moment of order placement. If an admin later updates the product's price from $20 to $50, previously placed orders retain the $20 snapshot.
2. **Nullable Foreign Key (`productId`)**: When a product is deleted from the IMS catalog, the database row in `products` is removed. The corresponding `orders` records retain their snapshots, and the nullable `productId` ensures referential integrity does not cause cascading deletes or query failures.

---

## 4. Monetary Accuracy: `BigDecimal`

### Decision
All monetary fields (`unitPrice`, `totalAmount`) in the domain models and calculations use `java.math.BigDecimal` rather than floating-point primitives (`float` / `double`). Floating-point representations in IEEE 754 introduce rounding errors when performing multiplication or division (e.g., `0.1 + 0.2 = 0.30000000000000004`), which is unacceptable in financial transactions.

---

## 5. Information Hiding & API Boundaries

### Decision
The administrative IMS endpoints (`/api/products`) and the public customer OMS storefront (`/api/store/products`) operate on different security and information-hiding boundaries:
* Internal staff require exact stock numbers to plan restocking and audits.
* Public storefront shoppers only need to know whether an item is available. Exposing exact inventory counts can leak competitor intelligence or enable inventory hoarding.
* The storefront endpoint maps entity data into `StoreProductResponse`, exposing a boolean `inStock` property (`stock > 0`) while hiding the numerical stock figure.

---

## 6. Authentication & User Isolation Strategy

### Specification Context
Per `PRODUCT.md`, authentication is explicitly out of scope for this assessment. The user context (`userId`) is currently passed via request parameters or request payloads.

### Production Migration Path
In a production deployment:
1. `userId` would be extracted directly from the verified security context (e.g., authenticated JWT claims via Spring Security) rather than accepted as an untrusted client parameter.
2. Method-level authorization (`@PreAuthorize`) would verify that users can only query orders matching their authenticated principal.
3. Role-based access control (RBAC) would restrict `/api/products` (IMS admin) to `ROLE_ADMIN` or `ROLE_STAFF`, while allowing `ROLE_CUSTOMER` access to `/api/store/**` and `/api/orders/**`.

---

## 7. Idempotency & Failure Recovery

### Production Consideration
If a customer submits an order and the network drops before the HTTP response returns, the client or user might retry the request, potentially creating duplicate orders and deducting stock twice.

In production, we would implement **request idempotency**:
1. Client generates a unique UUID `Idempotency-Key` header with each order request.
2. The server checks Redis or a dedicated database table for the key within an atomic check.
3. If the key exists, the server returns the cached response of the initial order rather than executing a second deduction.
