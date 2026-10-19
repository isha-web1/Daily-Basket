# Implementation Status

Last updated: 2026-10-19

## Summary

The backend is fully implemented against the existing Prisma schema and the requirements inferred from the React frontend. The frontend now reads and writes live data through the Express API instead of dummy data. Database migrations were applied additively; existing Neon tables were preserved.

- Backend tests: **19 passed, 0 failed** (`npm test`, ~57s)
- Frontend lint: **passing**
- Frontend production build: **passing**
- Backend typecheck/build: **passing**
- Database: **2 migrations applied**, 27 seeded products, 1 admin user, no test residue
- Vercel deployment: **live**; API, proxy, cookie auth, and SPA routing verified

## Environment

- Node 24.12.0
- Backend: Express 5.3, TypeScript 7, Prisma 7.10.1 with `@prisma/adapter-neon`, Neon PostgreSQL
- Frontend: React 19.2, Vite 8.3, Tailwind CSS 4.3, React Router 7.18
- Production frontend: https://daily-basket-web-ivory.vercel.app
- Production API: https://daily-basket-api.vercel.app

### Required environment files

- `server/.env`
  - `DATABASE_URL`
  - `JWT_SECRET` (32+ random chars)
  - `JWT_EXPIRES_IN` (default `7d`)
  - `CORS_ORIGIN` (default `http://localhost:5173`)
  - `PORT` (default `3000`)
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- `frontEnd/.env`
  - `VITE_API_URL` (default `http://localhost:3000/api`)

`server/.env` contains generated secrets and the seeded admin credentials. Do not commit it or print its values. Template: `server/.env.example`.

## Database

No existing tables were dropped or recreated.

- Baseline migration `0001_baseline` records the pre-existing schema and is marked applied.
- Additive migration `20261019131300_add_user_is_admin_and_indexes` adds:
  - `User.isAdmin`
  - `Product` indexes for category, deal, and creation queries
  - `Order` indexes for customer/status and creation queries
- Seed command: `npm run seed`
- Seed data: 27 products across 9 categories and one admin account.
- No destructive database commands were run.

## Backend

### Implemented

- Express app factory with Helmet, CORS allow-list, cookie parsing, JSON body limits, and centralized error handling.
- Zod request validation with structured `400` responses.
- JWT authentication stored in the httpOnly `db_token` cookie; optional Bearer token support.
- bcryptjs password hashing (12 rounds), username/email uniqueness, and admin RBAC.
- Rate limiting on authentication endpoints.
- Prisma singleton with the Neon serverless adapter and generated client.
- Graceful shutdown and a database-backed `/api/health` check.
- Server-side validation of prices, stock, totals, tax, and delivery fees. Totals are never trusted from the client.
- Transactional order placement with atomic stock decrement and validation.
- Order cancellation restores stock and records status history.
- Admin order status transitions are validated; delivery OTP is generated when an order becomes `Out for Delivery`.
- Admins can assign or reassign an active delivery partner to any non-terminal order.
- Ownership checks for addresses, orders, and order cancellation.
- API responses expose both `_id` and `id` for frontend compatibility.

### API surface

- `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Catalog: `GET /api/products`, `GET /api/products/:id`, `GET /api/categories`
- Addresses: `GET/POST /api/addresses`, `PATCH/DELETE /api/addresses/:id`
- Orders: `GET/POST /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id/cancel`
- Admin:
  - `GET /api/admin/stats`
  - `GET /api/admin/orders`
  - `PATCH /api/admin/orders/:id/status`
  - `PATCH /api/admin/orders/:id/delivery-partner`
  - `GET /api/admin/users`
  - `GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`
  - `GET/POST /api/admin/delivery-partners`, `PATCH/DELETE /api/admin/delivery-partners/:id`

### Business rules

- Currency: USD
- Tax: 8% of subtotal
- Delivery: free at subtotal >= $20, otherwise $5
- Order lifecycle: `Placed -> Confirmed -> Packed -> Out for Delivery -> Delivered`
- Cancellation is allowed before `Out for Delivery`; terminal statuses cannot transition.
- Stock is decremented at placement and restored on cancellation.

### Verification

```text
server> npm run build   # pass
server> npm run lint    # pass (tsc --noEmit)
server> npm test        # 19/19 pass
```

The integration suite runs against an ephemeral port and the configured Neon database. It creates temporary users/products/orders and deletes them in `after()`. It requires the seeded catalog and admin account.

## Frontend integration

### Completed

- Typed API client with credential cookies, timeouts, structured `ApiError`, and query builders.
- `AuthProvider`/`useAuth` with session restore via `/auth/me`.
- Real login/register forms, logout, and protected/admin route guards.
- Navbar auth menu, admin link, and cart integration.
- Product listing/search/category/deal/detail pages backed by the API, including pagination and filters.
- Address create/edit/delete/default management.
- Checkout with live addresses, server-calculated totals, and real order placement.
- Order history, cancellation, and tracking with live status history.
- Admin dashboard with live stats and recent orders, plus tabbed admin screens for adding/editing/deleting products, managing orders (search, status transitions, partner assignment), and delivery-partner CRUD.
- Frontend environment template and production build.
- Seeded/admin auth state was verified in a headless browser; unauthenticated `/admin` redirects to login.

### Smoke checks

- Home rendered seeded products (`Butter Croissant`, `Organic Quinoa`).
- Product detail, search, deals, and category pages loaded live API data.
- Admin route redirected to the login page without an authenticated session.
- CORS preflight from `http://localhost:5173` returned the correct allow-origin and credentials headers; an unlisted origin received `403`.
- Headless-browser flow verified: admin login redirected to the storefront, `/admin` rendered live dashboard stats, adding a product to the cart opened checkout, placing the order created a live order and tracking page, and cancellation restored stock. The temporary address/order were removed afterward.
- Production admin UI smoke verified: created and edited a product, created a delivery partner, placed a buyer order, assigned the partner from the Orders screen, advanced the order through `Confirmed -> Assigned -> Packed -> Out for Delivery -> Delivered`, then deleted the product and partner. Temporary order/user/product/partner records were removed afterward.

### Verification

```text
frontEnd> npm run lint    # pass
frontEnd> npm run build   # pass
```

## Postman / API testing assets

- `postman/Daily-Basket.postman_collection.json` — 51 requests across 6 ordered folders, with response assertions and automatic ID/token capture.
- `postman/Daily-Basket.postman_environment.json` — local `baseUrl`, `adminEmail`, and blank `adminPassword` (fill from `server/.env`).
- `postman/README.md` — import steps, endpoint reference, auth behavior, business rules, and cleanup instructions.

The collection was executed with Newman against the local API:

```text
requests: 51 executed, 0 failed
assertions: 51 executed, 0 failed
```

The run created temporary buyers/orders and automatically removed temporary products and delivery partners. Temporary buyers and their cascaded orders were removed afterward; the database is back to 27 products, 1 admin user, and no orders/addresses/partners.

## Vercel production deployment

- Backend project `daily-basket-api` deploys `server/` through `server/app.ts`; the Express factory remains in `server/src/createApp.ts`.
- Frontend project `daily-basket-web` deploys `frontEnd/` and serves the stable alias `daily-basket-web-ivory.vercel.app`. The similarly named `daily-basket-web.vercel.app` belongs to another account.
- The frontend rewrites `/api/*` to `https://daily-basket-api.vercel.app/api/*`, keeping `db_token` first-party.
- Production API env is configured for `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, and `NODE_ENV`; frontend production env sets `VITE_API_URL=/api`.
- Verified against production:
  - API health reports `database: ok`.
  - Catalog data returns from the API and through the frontend proxy.
  - Admin login through the proxy sets an httpOnly, `SameSite=None`, `Secure` cookie.
  - `/api/auth/me` and `/api/admin/stats` accept that cookie.
  - `/products` serves the SPA shell.
  - CORS preflight from the production frontend returns `204` with credentials; unlisted origins are rejected.
- Deployment details and commands: `DEPLOYMENT.md`.

## Known limitations / remaining work

- `PROJECT_SPEC.md` was empty. Requirements were inferred from the frontend and Prisma schema; assumptions are recorded in `IMPLEMENTATION_PLAN.md`.
- Admin screens are implemented for Dashboard, Add Product, Products, Orders (with status changes and delivery-partner assignment), and Delivery Partners. Admin user management remains API-only.
- Delivery OTP is generated and stored but there is no email/SMS delivery integration.
- Logout clears the cookie but does not maintain a server-side JWT revocation list (stateless JWT).
- No payment gateway integration; checkout records the order directly.
- There are no automated frontend component or E2E tests. API integration tests and the production build/lint cover the backend and compile-time frontend correctness.
- `npm audit --omit=dev` reports 0 production vulnerabilities. npm reports 3 high advisories in frontend dev tooling; these were not force-fixed to avoid breaking upgrades.
- The frontend bundled catalog assets (`src/assets/assets.ts`) remain in the repository but are no longer used as data sources.
- Vercel projects are deployed manually; Git integration is not connected.
- Only Vercel Production environment variables are configured. Preview deployments would need their own env vars and CORS origins.
- `frontEnd/.env.production` is gitignored; the Vercel `VITE_API_URL` variable is the deployed source of truth.

## Setup / run

```bash
# backend
cd server
npm install
npx prisma generate
npm run prisma:migrate
npm run seed
npm run dev            # http://localhost:3000

# frontend
cd frontEnd
npm install
npm run dev            # http://localhost:5173
```

Admin credentials are in `server/.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). Change them before sharing the deployment publicly.

Production deployment commands and verification are in `DEPLOYMENT.md`.
