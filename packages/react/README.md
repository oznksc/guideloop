# @guideloop/react

React guided tours & onboarding. Powered by [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

```bash
npm i @guideloop/react
```

Peers: `react` / `react-dom` ≥16.8. `core` is installed automatically.

## Usage

```tsx
import { GuideLoop } from '@guideloop/react';

<GuideLoop
  steps={[{ target: '#cta', title: 'Welcome', content: 'Start here.' }]}
  isOpen={open}
  onClose={onClose}
  theme="tailwind"
/>
```

## Entries

| Import | Purpose |
|--------|---------|
| `@guideloop/react` | Components & hooks |
| `@guideloop/react/builder` | Dev-only Tour Builder |
| `@guideloop/react/types` | RSC-safe types + storage |

```tsx
const { TourBuilder } = await import('@guideloop/react/builder'); // gate in production
```

```ts
import type { Step } from '@guideloop/react/types';
```

Also: `OnboardingChecklist`, `Spotlight`, `Progress`, `debug` prop.

Docs & demo: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop) · [live](https://oznksc.github.io/guideloop/)

MIT
