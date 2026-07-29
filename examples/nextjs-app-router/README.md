# Next.js App Router example

Demonstrates GuideLoop inside the **Next.js App Router** with a multi-page tour.

## Features

- Client island (`TourProvider` + `"use client"`) so Server Components stay free of DOM APIs
- Step definitions imported from `guideloop/types` (RSC-safe, no client boundary)
- Shared step definitions across `/` and `/dashboard`
- `persist` + `autoRestore` so the tour resumes after client navigation
- `debug="auto"` (HUD only when `NODE_ENV === 'development'`)

## Run

```bash
# from repo root
npm run build

cd examples/nextjs-app-router
npm install
npm run dev
```

Open [http://localhost:3100](http://localhost:3100).

## Flow

1. Click **Start multi-page tour** on the home page.
2. Advance to the dashboard link step, then open **Dashboard**.
3. The tour restores via `sessionStorage` and highlights `#dashboard-metric`.
