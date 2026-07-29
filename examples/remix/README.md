# Remix example

GuideLoop multi-route tour using **Remix (Vite)** and `persist.autoRestore`.

## Features

- Client tour host shared across routes
- Session-scoped progress for SPA navigations
- Material theme sample

## Run

```bash
# from repo root
npm run build

cd examples/remix
npm install
npm run dev
```

Open [http://localhost:3102](http://localhost:3102).

## Flow

1. Start the tour on Home.
2. Advance to the Settings link step and navigate to **Settings**.
3. Tour restores on `#settings-toggle`.
