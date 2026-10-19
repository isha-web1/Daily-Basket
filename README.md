# Daily Basket | Fresh groceries, a smoother way to shop

Daily Basket is a full-stack grocery storefront for discovering everyday essentials and managing the journey from product browsing to order tracking. This React client pairs with the Express API in [`../server`](../server/README.md) for catalog, account, address, checkout, and admin data.

![Daily Basket storefront](frontEnd/src/assets/screenshot.png)

**Live app:** [daily-basket-web-ivory.vercel.app](https://daily-basket-web-ivory.vercel.app) · **API:** [daily-basket-api.vercel.app](https://daily-basket-api.vercel.app)

## Why Daily Basket

Grocery shopping is a sequence of small decisions: find the right item, understand its price and availability, place an order, then know what happens next. Daily Basket brings those steps into one responsive experience, while keeping important order and pricing decisions on the server.

## Features

- **Find products quickly:** browse categories, search the catalog, inspect product details and ratings, and explore flash deals.
- **Build a persistent cart:** adjust item quantities and keep cart contents in local storage between visits.
- **Complete the customer journey:** sign in, manage delivery addresses, check out, view past orders, and follow order status.
- **Manage the store:** admin views provide an overview plus product, order, and delivery-partner workflows.
- **Shop on different screens:** responsive layouts keep catalog browsing and checkout usable on mobile and desktop.
- **Handle real API states:** loading, empty, and error states are shown when catalog or account requests are pending or fail.

## Engineering challenges

- **Session continuity:** API requests include credentials so the server can maintain authentication with an httpOnly cookie; production requests use the site's `/api` proxy.
- **Reliable asynchronous screens:** data-driven views handle loading, failures, cancellation, and empty results without presenting stale responses as current data.
- **Trusted checkout:** the client sends the cart and address, while the server checks stock and calculates the final order total.
- **Responsive information density:** product grids, navigation, and order details adapt to small screens without hiding the essentials.

## Tech stack

| Area                   | Tools                         |
| ---------------------- | ----------------------------- |
| UI                     | React 19, TypeScript          |
| Dev server and bundler | Vite 8                        |
| Styling                | Tailwind CSS 4                |
| Routing                | React Router 7                |
| Icons and feedback     | Lucide React, React Hot Toast |
| Maps                   | Leaflet, React Leaflet        |

## Run locally

**Requirements:** Node.js 24 and npm. Start the API separately; see [`../server/README.md`](../server/README.md).

```bash
npm install
npm run dev
```

The client defaults to `http://localhost:3000/api`. To point it at another API, create a local `.env` file and set:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Open the Vite URL printed in the terminal.

## Routes

| Route           | Experience                       |
| --------------- | -------------------------------- |
| `/`             | Storefront and featured products |
| `/products`     | Catalog and category browsing    |
| `/products/:id` | Product details                  |
| `/search`       | Search results                   |
| `/deals`        | Flash deals                      |
| `/login`        | Sign in and account access       |
| `/checkout`     | Delivery and order placement     |
| `/addresses`    | Saved delivery addresses         |
| `/orders`       | Order history                    |
| `/orders/:id`   | Order tracking                   |
| `/admin`        | Admin overview and management    |

## Scripts

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Start the Vite development server.                     |
| `npm run lint`    | Run ESLint.                                            |
| `npm run build`   | Type-check and create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally.                  |

## Project layout

```text
src/
├── assets/       # Storefront screenshot, product and category imagery
├── components/   # Shared navigation, product, cart, and layout UI
├── context/      # Authentication and cart state
├── lib/          # API clients and frontend helpers
├── pages/        # Customer and admin screens
├── types/        # Shared TypeScript models
└── utils/        # Formatting helpers
```

## Current boundaries

The API-backed catalog, account, address, order, and admin workflows are implemented. Payment processing and email/SMS notifications are not integrated; the newsletter form currently provides a client-side confirmation only.
tests/ # API integration tests
