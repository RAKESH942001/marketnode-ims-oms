# Take-Home: Order Management System

## Overview

This repository contains an existing **Inventory Management System (IMS)** — the internal tool that staff use to manage the product catalog and stock. The backend and frontend cover the core product management workflows described in `PRODUCT.md`.

The next product change is the **Order Management System (OMS)**. The OMS is a customer-facing storefront for browsing products and placing orders, and it uses the same product catalog and inventory rules as the IMS.

You are taking ownership of the repository for this change. Deliver the final system as a coherent working application, not just a set of new files.

**Before you start, review [`PRODUCT.md`](PRODUCT.md). It is the source of truth for the expected behavior, data models, and business rules for both systems.**

Your submission will be evaluated on the final state of the repository and its **overall engineering quality**.

## Your Work

Add the **Order Management System (OMS)** described in `PRODUCT.md`, while keeping the existing IMS usable.

The submitted application should follow `PRODUCT.md` for the systems and workflows it contains.

At minimum, the OMS should include these screens:

| Screen | Purpose |
|--------|---------|
| Product Catalog | Browse available products |
| Product Detail | View product information and place an order |
| Order History | View past orders |
| Order Detail | View order details |

At minimum, the OMS should include these API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/store/products` | List available products |
| `GET` | `/api/store/products/{id}` | Product detail |
| `POST` | `/api/orders` | Place order |
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/{id}` | Get order detail |

Order statuses: `CREATED` | `CANCELLED`

The reviewer should be able to start the submitted repository from the root with:

```bash
docker-compose up
```

After startup, the delivered browser app(s) and API(s) should be usable without extra application commands.

## Notes

- UI/UX design and visual polish are **not** part of the core assessment, but thoughtful user experience may be considered a plus.
- Authentication is out of scope.
- Keep your changes focused on what is needed to deliver the system well.
- **Expected effort: 2–3 hours.** The scope is intentionally contained — do not spend more than 6 hours.

## AI Usage

Using AI tools (Copilot, ChatGPT, Claude, etc.) is **encouraged**. Use whatever helps you work effectively.

Maintain `ai-prompt.log` — append a numbered entry for every AI interaction, in the order they occurred.

Format:

```text
---
timestamp: 2026-04-27T10:30:00Z
model: GPT-5.3-Codex
prompt: |
  <full prompt text>
---
```

## Submission

- Branch: `candidate/<your-name>`
- **Deadline: exactly 7 days (168 hours) from when repository access is granted.**
- Commits after the deadline will not be reviewed.
- Do not add third-party Docker images to `docker-compose.yml`.

## Deliverables

- Running system via `docker-compose up` from the repository root
- `ai-prompt.log`
