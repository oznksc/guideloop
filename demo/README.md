# GuideLoop landing and live experience

This Next.js application is the public GuideLoop product landing page. It
introduces the library, embeds a real interactive tour and onboarding checklist,
and is exported to GitHub Pages.

## Local development

```bash
cd demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Static export

```bash
npm run build
```

The export is written to `demo/out`. GitHub Actions sets
`NEXT_PUBLIC_BASE_PATH` to `/guideloop` when publishing the project site.

### Tour Builder (dev only)

The floating **GL** Tour Builder is available under `npm run dev`. Production
builds do **not** include it:

1. Layout skips rendering when `NODE_ENV !== 'development'`.
2. `next.config.mjs` aliases `guideloop/builder` → `src/shims/empty-builder.tsx`
   in production, so the builder UI cannot end up in the static export.
