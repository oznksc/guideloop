# @guideloop/react

React guided tour / onboarding library powered by [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

## Install

```bash
npm install @guideloop/react
```

Peer dependencies: `react` and `react-dom` (>=16.8). `@guideloop/core` is installed automatically.

## Usage

```tsx
import { GuideLoop } from '@guideloop/react';

const steps = [
  { target: '#cta', title: 'Welcome', content: 'Click here to get started.' },
];

export function AppTour({ open, onClose }) {
  return <GuideLoop steps={steps} isOpen={open} onClose={onClose} />;
}
```

### Subpath exports

| Import | Purpose |
| --- | --- |
| `@guideloop/react` | Main components & hooks |
| `@guideloop/react/builder` | Dev-only Tour Builder (code-split entry) |
| `@guideloop/react/types` | RSC-safe types + storage helpers |

```tsx
// Dynamic import keeps the builder out of production bundles
const { TourBuilder } = await import('@guideloop/react/builder');
```

```ts
import type { Step } from '@guideloop/react/types';
```

## Docs

Full documentation, themes, and examples: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop)

Live demo: [oznksc.github.io/guideloop](https://oznksc.github.io/guideloop/)

## License

MIT
