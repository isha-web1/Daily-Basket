# AGENTS.md

## Project layout

- `server/` — Express 5 + TypeScript + Prisma 7 + Neon PostgreSQL API.
- `frontEnd/` — React 19 + Vite 8 + Tailwind 4 client.
- `IMPLEMENTATION_PLAN.md` — inferred requirements, assumptions, and plan.
- `IMPLEMENTATION_STATUS.md` — verified results and known gaps.
- `DEPLOYMENT.md` — Vercel project URLs, environment, and deploy/verification steps.

## Backend commands (`server/`)

```bash
npm install
npx prisma generate
npm run prisma:migrate     # prisma migrate deploy
npm run seed               # 27 products + admin account
npm run dev                # nodemon + tsx, port 3000
npm start                  # tsx, port 3000
npm run build              # tsc
npm run lint               # tsc --noEmit
npm test                   # integration tests; requires seeded DB, ~60s
```

- Copy `server/.env.example` to `server/.env` and fill in real values.
- Never print or commit `server/.env`; it contains generated secrets and admin credentials.
- Do not run destructive Prisma commands (`migrate reset`, `db push --force-reset`, `drop`) against the shared Neon database.
- Create additive migrations only. If baseline drift occurs, resolve it without recreating existing tables.
- Integration tests use the configured database and clean up their temporary users, products, addresses, and orders.
- Postman assets live in `postman/`; import the collection and environment, then set `adminPassword` from `server/.env`. See `postman/README.md` for run order and cleanup SQL.

## Frontend commands (`frontEnd/`)

```bash
npm install
npm run dev                # Vite, port 5173
npm run build              # tsc -b + vite build
npm run lint               # eslint .
npm run preview
```

- Set `VITE_API_URL` in `frontEnd/.env` if the API is not at `http://localhost:3000/api`.
- Production uses the first-party `/api` proxy; `VITE_API_URL=/api` is set in Vercel and `frontEnd/.env.production` (gitignored).
- Requests use `credentials: "include"`; the API authenticates with the httpOnly `db_token` cookie.
- Preserve the existing Tailwind design language and component patterns.
- `react-hooks/set-state-in-effect` is disabled in `eslint.config.js` because data-fetching effects intentionally set loading/error state. Keep the state-in-effect hook pattern consistent.

## API conventions

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "message": "...", "code": "...", "errors"?: ... }`
- Product/order/address payloads include both `_id` and `id`.
- Auth is cookie-based by default; admin routes require `User.isAdmin`.
- Server calculates tax (8%), delivery (free at $20+, otherwise $5), and order totals. Never trust client totals.
- Order status progression is validated in `server/src/lib/orderStatus.ts`.

## Deployment

- Frontend: https://daily-basket-web-ivory.vercel.app
- API: https://daily-basket-api.vercel.app
- `daily-basket-web.vercel.app` belongs to another account; do not use it.
- The frontend rewrites `/api/*` to the API alias so auth cookies stay first-party.
- Vercel API env: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV`.
- Vercel frontend env: `VITE_API_URL=/api`.
- Deploy manually with `vercel deploy --prod` from `server/` and `frontEnd/`; see `DEPLOYMENT.md`.
- Add matching Preview env vars and CORS origins before enabling Git preview deployments.
- Keep the direct `express` import in `server/app.ts` and the `express.d.ts` reference in `server/src/createApp.ts`; Vercel's build depends on both.

## Quality gates

Run before finishing backend changes:

```bash
cd server && npm run build && npm run lint && npm test
```

Run before finishing frontend changes:

```bash
cd frontEnd && npm run lint && npm run build
```

## Known gaps

- `PROJECT_SPEC.md` is empty; see assumptions in `IMPLEMENTATION_PLAN.md`.
- Admin user management remains API-only; product, order, and delivery-partner screens are implemented.
- No payment, email, or SMS integration.
- No frontend E2E suite yet.
- Vercel projects are not Git-connected yet; only Production env vars are configured.
