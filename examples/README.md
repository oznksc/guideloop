# GuideLoop Examples Library

Production-ready starter apps showing how to integrate [guideloop](https://www.npmjs.com/package/guideloop) across common React stacks.

Each example is a **standalone package** (not required to run the main library tests). They depend on the monorepo root via `file:../..` so you always exercise the local build.

| Example | Stack | Highlights |
| --- | --- | --- |
| [`nextjs-app-router`](./nextjs-app-router) | Next.js 14 (App Router) | `"use client"`, multi-page tour + `persist` |
| [`vite-react`](./vite-react) | Vite + React 18 | Shapes, multi-spotlight, Debug HUD |
| [`remix`](./remix) | Remix (Vite) | Multi-route tour resume across pages |
| [`react-native-web`](./react-native-web) | Vite + React Native Web | DOM tour over RN-Web primitives |

## Prerequisites

From the **repository root**:

```bash
npm install
npm run build
```

Examples import `guideloop` from `dist/`, so the library must be built first.

## Run an example

```bash
cd examples/vite-react   # or nextjs-app-router | remix | react-native-web
npm install
npm run dev
```

Open the printed localhost URL and start the tour from the page UI.

## Using published npm package

To try against the published package instead of the local monorepo build, change each example’s dependency:

```json
"guideloop": "^1.4.2"
```

## Conventions

- TypeScript + React 18
- Minimal CSS (no design-system lock-in)
- Clear `README.md` per example with what it demonstrates
- Tours use stable `id` attributes as targets
- Multi-page examples use `persist={{ key, type: 'sessionStorage', autoRestore: true }}`

## Adding a new example

1. Create `examples/<name>/` with its own `package.json` (`"guideloop": "file:../.."`).
2. Keep the app small and focused on one integration pattern.
3. Document the pattern in this README table and the root `README.md`.
