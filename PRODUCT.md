# Functional Specification

## 1. Overview

MarketNode operates two systems that share a single product catalog and database:

- **Inventory Management System (IMS)** — an internal back-office application used by staff to manage the product catalog, pricing, and stock levels.
- **Order Management System (OMS)** — a customer-facing storefront for browsing products and placing orders.

The IMS is the system of record for products and inventory. The OMS reads from the same catalog and creates orders that deduct stock.

Payment, authentication, and shipment are out of scope for both systems.

---

## 2. Inventory Management System (IMS)

The IMS is used by internal staff to manage the full product lifecycle.

### 2.1 Features

| Feature | Description |
|---------|-------------|
| **View Products** | Staff can see a list of all products with their name, category, description, price, and current stock level. |
| **Add Product** | Staff can create a new product by providing name, category, description, and price. New products start with zero stock. |
| **View Product Detail** | Staff can view the full details of any product. |
| **Edit Product** | Staff can update a product's name, category, description, and price. Stock is managed separately through the Adjust Stock feature. |
| **Delete Product** | Staff can remove a product from the catalog. Deleted products must no longer appear in any listing, including the storefront. |
| **Adjust Stock** | Staff can increase or decrease a product's stock level by a specified amount. Stock must not go below zero. |

### 2.2 Product Data Model

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **Name** | String | Required. 1–255 characters. | Display name of the product. |
| **Description** | String | Optional. Max 2,000 characters. | Detailed product description. |
| **Category** | Enum | Required. One of: `Electronics`, `Clothing`, `Home & Garden`, `Sports`, `Books`, `Other`. | Product grouping for catalog organization. |
| **Price** | Decimal | Required. 0.00–99,999.99. Two decimal places (e.g., `29.99`). | Unit price in USD. |
| **Stock** | Integer | Required. 0–999,999. Defaults to `0` on creation. | Current quantity available in inventory. |

### 2.3 Business Rules

**Product Creation:**
- All required fields (name, category, price) must be provided.
- Price must be zero or positive.
- Stock is always initialized to zero — it can only be changed through stock adjustments.

**Product Editing:**
- Only name, description, category, and price can be updated.
- Stock cannot be modified through the edit operation.

**Product Deletion:**
- Deleted products must not appear in any product listing (IMS or OMS).
- Products that have been referenced in existing orders must be handled gracefully — order history must remain intact.

**Stock Adjustment:**
- Stock can be increased or decreased by a specified integer amount.
- Stock must not go below zero. Attempts to reduce stock below zero must be rejected with an error.

---

## 3. Order Management System (OMS)

The OMS is the customer-facing storefront for browsing and ordering products.

### 3.1 Features

| Feature | Description |
|---------|-------------|
| **Browse Products** | Customers can see a list of available products with name, category, price, and stock availability. Exact stock counts must not be exposed — only an in-stock or out-of-stock indicator. |
| **View Product Detail** | Customers can view the full description and details of a product. From this screen, customers can select a quantity and place an order. |
| **Order History** | Customers can see a list of their own past orders with status, total amount, and date placed. |
| **View Order** | Customers can view the full details of a placed order, including product name, quantity, unit price, total amount, and current status. |

### 3.2 Order Data Model

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **Status** | Enum | One of: `CREATED`, `CANCELLED`. Defaults to `CREATED`. | Current state of the order. |
| **User ID** | Integer | Required. References the user who placed the order. | Identifies which user placed the order. |
| **Product Name** | String | Captured at time of order. Immutable. | Name of the product when the order was placed. |
| **Quantity** | Integer | Required. 1–999. | Number of units ordered. |
| **Unit Price** | Decimal | Captured at time of order. Immutable. 0.00–99,999.99. Two decimal places. | Price per unit when the order was placed. |
| **Total Amount** | Decimal | Computed: `quantity × unit price`. 0.00–99,999,999.99. Two decimal places. | Total cost of the order. |

### 3.3 Business Rules

**Product Browsing:**
- The storefront must not expose exact stock counts. A simple in-stock / out-of-stock indicator is sufficient.
- Out-of-stock products may still be visible but must be clearly indicated as unavailable.

**Order Placement:**
- Each order references a single product, a quantity, and the user placing it.
- Quantity must be at least 1.
- If the referenced product does not exist, the order must be rejected.
- If the product does not have sufficient stock, the order must be rejected with a clear reason.
- When an order is placed successfully, stock is deducted from inventory.
- Product name and unit price must be captured at the time of order — later changes to the product must not affect historical order records.

**Order Cancellation:**
- When an order is cancelled, its status changes from `CREATED` to `CANCELLED` and the deducted stock is restored to inventory.
- Only orders with status `CREATED` can be cancelled.

**Data Integrity:**
- Order records must remain intact even if the referenced product is later deleted or modified.
