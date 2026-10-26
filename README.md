# Cyberspace Web

Next.js frontend for Cyberspace — a multi-language IT products, solutions, and services site with a full admin dashboard. Talks to [`cyberspace-backend`](https://github.com/mohammodrubel/cyberspace-backend) (Express + Prisma + PostgreSQL) for all data.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Webpack)
- **UI:** React 19, Tailwind CSS 4, Radix UI, lucide-react, framer-motion
- **State/data:** Redux Toolkit + RTK Query, redux-persist
- **Auth:** JWT (`jwt-decode`), stored via auth slice
- **i18n:** Custom dictionary-based i18n (`AZ` / `EN` / `RU`) in `src/lib/i18n.ts`

## Data Model (mirrors backend Prisma schema)

Product, ProductTranslation, Inquiry, User, Setting, Banner, Partner, News, NewsTranslation, HomeContent, Category — see backend README for full schema.

## Features

- Public site: home, products, categories, news, partners, inquiry form — localized in AZ/EN/RU
- Admin dashboard (`/[lang]/dashboard/admin`): products, categories, inquiries, users, partners, news, home content, settings, change password
- Server-side proxy API routes under `src/app/api/*` that forward to the backend

## Getting Started

### Prerequisites

- Node.js (LTS)
- Running instance of [`cyberspace-backend`](https://github.com/mohammodrubel/cyberspace-backend)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```env
BACKEND_URL="http://localhost:9000/api"
```

Point it at the running backend's API base URL.

### 3. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
npm start
```

### 5. Type-check

```bash
npm run lint
```

## Project Structure

```
src/
  app/
    api/            server-side proxy routes to the backend
    [lang]/         localized public pages + admin dashboard
    layout.tsx
  components/       UI + dashboard components
  lib/              i18n, seo, server-auth helpers
  redux/
    fetchers/       RTK Query API slices (auth, product, category,
                     inquiry, setting, user, partner, news, homeContent)
    store.ts
```
