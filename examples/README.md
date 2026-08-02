# Examples

Standalone demos. Build the monorepo first:

```bash
# repo root
npm i && npm run build
cd examples/<name> && npm i && npm run dev
```

| Example | Stack | Shows |
|---------|--------|--------|
| [`nextjs-app-router`](./nextjs-app-router) | Next.js App Router | Client island + multi-page `persist` |
| [`vite-react`](./vite-react) | Vite + React | Shapes, multi-spotlight, Debug HUD |
| [`remix`](./remix) | Remix | Multi-route resume |
| [`react-native-web`](./react-native-web) | RN Web | DOM tour over RN primitives |
| [`tour-builder`](./tour-builder) | Vite | Visual builder (pick → export) |
| [`vanilla`](./vanilla) | Static HTML | `@guideloop/vanilla` (no React) |

Local packages use workspace / `file:` links. For npm:

```json
"@guideloop/react": "^2.0.2"
```
