# React Native Web example

Runs GuideLoop in the **browser** over `react-native-web` primitives.

> GuideLoop is DOM-based. This example is for RN-Web / universal web UIs, not
> pure native iOS/Android. Targets must expose HTML `id`s — use `nativeID` on
> RN components (maps to `id` on web).

## Features

- Vite alias `react-native` → `react-native-web`
- `nativeID` selectors for spotlight targets
- Circle spotlight on a compact pill view
- Debug HUD enabled for inspection

## Run

```bash
# from repo root
npm run build

cd examples/react-native-web
npm install
npm run dev
```

Open [http://localhost:3103](http://localhost:3103).
