# Deployment

## Live URLs

- Frontend: https://daily-basket-web-ivory.vercel.app
- API: https://daily-basket-api.vercel.app

`daily-basket-web.vercel.app` is owned by a different Vercel account and is **not** this project. Use the `-ivory` URL above.

## Architecture

Two Vercel projects deploy from this repository:

- `daily-basket-api` — `server/`, Express 5 serverless function
- `daily-basket-web` — `frontEnd/`, Vite static build

The browser calls the frontend's own `/api/*` path. `frontEnd/vercel.json` rewrites those requests to the API project, so the `db_token` cookie is first-party. Direct cross-site cookies are avoided because `vercel.app` is a public suffix. The API still enforces CORS for its production frontend origin.

```text
browser -> https://daily-basket-web-ivory.vercel.app/api/*
        -> https://daily-basket-api.vercel.app/api/*
```

## Production environment variables

`daily-basket-api` (Production):

- `DATABASE_URL` — Neon connection string (Secret)
- `JWT_SECRET` — signing secret (Secret)
- `JWT_EXPIRES_IN` — token lifetime, e.g. `7d`
- `CORS_ORIGIN` — `https://daily-basket-web-ivory.vercel.app`
- `NODE_ENV` — `production`

`daily-basket-web` (Production):

- `VITE_API_URL` — `/api`

`frontEnd/.env.production` also sets `VITE_API_URL=/api` for local production builds, but it is gitignored. The Vercel project variable is the deployed source of truth.

Only the Production environment is configured. Add matching Preview variables before enabling Git preview deployments; `CORS_ORIGIN` must include each preview frontend origin or the API will reject it.

## Backend entrypoint

Vercel detects Express through `server/app.ts`, which directly imports `express` and default-exports the configured app. The reusable factory lives in `server/src/createApp.ts`; `server/server.ts` remains the local listener.

`server/src/createApp.ts` references `src/types/express.d.ts` explicitly because Vercel's TypeScript compilation does not pick up the global `Express.Request.user` augmentation automatically. Keep that reference.

`server/vercel.json` sets the Express framework and a 60-second function duration. `server/.vercelignore` excludes tests, build output, dependencies, and local env files.

## Deploy

```bash
# API
cd server
vercel link --yes --project daily-basket-api
vercel deploy --prod --yes --project daily-basket-api

# Frontend
cd ../frontEnd
vercel link --yes --project daily-basket-web
vercel deploy --prod --yes --project daily-basket-web
```

Set or replace environment variables with the Vercel dashboard or CLI. Example:

```bash
vercel env add JWT_SECRET production --sensitive --project daily-basket-api
vercel env add CORS_ORIGIN production --project daily-basket-api
vercel env add VITE_API_URL production --project daily-basket-web
```

Environment changes on the API require a new deployment to take effect.

## Database

The production API uses the same Neon database as local development. Apply additive migrations before deploying code that expects them:

```bash
cd server
npm run prisma:migrate
npm run seed   # only when the catalog/admin are missing
```

Never run `prisma migrate reset`, `db push --force-reset`, or drop commands against this shared database.

Admin credentials are stored in `server/.env`; do not print or commit them. Change the seeded password before sharing the deployment publicly.

## Verification

```bash
curl https://daily-basket-api.vercel.app/api/health
curl "https://daily-basket-api.vercel.app/api/products?limit=1"
curl -I https://daily-basket-web-ivory.vercel.app
curl "https://daily-basket-web-ivory.vercel.app/api/products?limit=1"
curl -I https://daily-basket-web-ivory.vercel.app/products
```

Expected: health reports `database: ok`, the API and proxied API return `200`, the storefront loads, and SPA routes fall back to `index.html`.

Verified in production:

- `GET /api/health` returns `200` with `database: ok`.
- `GET /api/products` returns seeded catalog data.
- Frontend `/api` rewrite returns API responses.
- Admin login through the frontend proxy returns an httpOnly, `SameSite=None`, `Secure` `db_token` cookie.
- `/api/auth/me` and `/api/admin/stats` accept that cookie.
- `/products` serves the SPA shell.
- CORS preflight from `https://daily-basket-web-ivory.vercel.app` returns `204` with credentials allowed; unlisted origins are rejected.

## Operational notes

- Git is not connected to either Vercel project; deployments are currently manual with `vercel deploy --prod`.
- Vercel preview deployment URLs may require Vercel authentication. The production aliases above are public.
- `vercel link` creates ignored `.vercel/` directories and `.env.local` files. Never commit them.
- The frontend rewrite target is the stable API alias, not an individual deployment URL.
