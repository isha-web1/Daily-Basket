# Daily Basket — Audit & Implementation Plan

## Audit findings

### Repository / tooling
- Frontend: React 19 + TypeScript, Vite 8, Tailwind CSS 4, React Router 7. Located in `frontEnd/`.
- Backend: Node.js + TypeScript + Express 5.3, Prisma 7.10.1 with `@prisma/adapter-neon`.
- Database: Neon PostgreSQL (`neondb`). Tables already exist and are **empty**:
  `User`, `Address`, `Product`, `Order`, `DeliveryPartner`.
- No Prisma migration history exists. The database is not managed by Prisma Migrate.
- `PROJECT_SPEC.md`, `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_STATUS.md` were empty at audit time.
- Backend only exposes `GET /` and has no API, auth, validation, or error handling.
- Frontend currently uses `dummyProducts`, `dummyAddressData`, and `dummyDashboardOrdersData` everywhere. Login is a 1-second fake redirect; `ProtectedRoute` is a pass-through.
- Frontend expects `_id` identifiers, so API serializers will expose `_id` (and `id` for new integrations).

### Existing schema
- `User`: id, name, email (unique), password, phone, avatar, addresses, orders.
- `Address`: id, userId, label/address/city/state/zip, isDefault, lat, lng.
- `Product`: id, name, description, price, originalPrice, image, category, unit, stock, isOrganic, rating, reviewCount.
- `Order`: id, userId, items (JSON snapshot), shippingAddress (JSON), paymentMethod, subtotal/deliveryFee/tax/total, status, statusHistory (JSON), delivery partner, OTP, live location, isPaid.
- `DeliveryPartner`: id, name, email (unique), password, phone, avatar, vehicleType, isActive.
- Frontend `User` type includes `isAdmin`; the schema is missing it. This is the only requirement-driven schema change.
- Database tables match the current schema exactly. No destructive migration is needed.

### Gaps found
1. No authentication/authorization, password hashing, JWT/cookie handling, or admin role.
2. No product catalog API (listing, search, filtering, sorting, pagination, detail).
3. No address CRUD API.
4. No order creation, order history, order tracking, or stock transaction logic.
5. No admin dashboard metrics / order administration.
6. No request validation, centralized errors, CORS environment config, or security headers.
7. No seed data — the database is empty, so the frontend would have nothing to display.
8. Frontend is entirely mock-driven and unauthenticated.

## Implementation plan

### Phase 1 — Database / Prisma (safe, additive)
1. Baseline the existing schema into `prisma/migrations/0001_baseline` and mark it applied without executing destructive SQL.
2. Add `User.isAdmin Boolean @default(false)` and generate a reviewed additive migration.
3. Generate the Prisma client for the installed 7.10.1 version.
4. Add an idempotent seed script for the demo catalog and an admin user sourced from `.env`.
5. Verify connectivity with read-only checks.

### Phase 2 — Express foundation
- `src/app.ts` application factory, `server.ts` listener.
- Environment config validation, CORS allow-list, Helmet, JSON body limit, cookie parser.
- Central error handler, 404 handler, async wrapper, typed `ApiError`.
- Zod validation middleware, consistent `{ success, data }` / `{ success:false, message, errors }` responses.

### Phase 3 — API surface
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- `GET /api/products` (search, category, price range, sort, deals, pagination, excludeId), `GET /api/products/:id`, `GET /api/categories`.
- `GET/POST /api/addresses`, `PATCH/DELETE /api/addresses/:id`, `PATCH /api/addresses/:id/default`.
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`.
- Admin: `GET /api/admin/stats`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`, `GET/POST/PATCH/DELETE /api/admin/products`, `GET /api/admin/users`.
- Ownership checks on addresses and orders; admin-only middleware for admin routes.

### Phase 4 — Frontend integration
- API client using `VITE_API_URL`, `credentials: "include"`.
- Auth context (`me`, login, register, logout) and real protected/admin routes.
- Real product data on Home, Products, Product detail, Search, Deals.
- Real address CRUD, checkout/order placement, order history, and tracking.
- Real admin dashboard stats/recent orders.
- Loading, empty, validation, and error states throughout.
- Keep existing UI, responsive layout, cart persistence, and styling.

### Phase 5 — Verification
- Backend TypeScript build; Prisma generate/validate; migration status.
- Seed execution and safe DB counts.
- API integration tests (auth, catalog, addresses, orders, ownership, admin RBAC).
- Frontend type-check/build/lint.
- Update `IMPLEMENTATION_STATUS.md` with actual commands/results.

## Assumptions (because `PROJECT_SPEC.md` is empty)
- Currency is USD, tax is 8%, delivery is free at $20+ otherwise $5 (matching the existing checkout UI).
- JWT is transported in an httpOnly cookie (`db_token`), with optional Bearer support.
- Product categories remain a fixed storefront taxonomy; `Product.category` stores the slug.
- Reviews are display-only in the current UI and have no persisted model; rating/reviewCount stay on Product.
- Delivery partner management is represented in the schema and order administration but has no dedicated UI route.
