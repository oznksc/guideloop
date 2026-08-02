# @guideloop/vanilla

Imperative guided tours + Web Components. No React. Powered by [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

```bash
npm i @guideloop/vanilla
```

## Imperative

```js
import { GuideLoop } from '@guideloop/vanilla';

const tour = new GuideLoop({
  steps: [
    { target: '#welcome', title: 'Welcome', content: 'First step.', placement: 'bottom' },
    { target: '#cta', title: 'CTA', content: 'Click this.', placement: 'right' },
  ],
  theme: 'tailwind', // material | antd | custom
  onComplete: () => {},
  onClose: () => {},
});

await tour.start();
// tour.next() · tour.prev() · tour.goTo(i) · tour.skip() · tour.close() · tour.destroy()
// tour.isOpen · tour.currentStep
```

### Options (essentials)

| | | default |
|--|--|--|
| `steps` | `Step[]` | required |
| `theme` | `tailwind \| material \| antd \| custom` | `tailwind` |
| `customTheme` | `Partial<ThemeConfig>` | — |
| `overlay` / `keyboard` / `scrollSmooth` | `boolean` | `true` |
| `spotlightPadding` | `number` | `8` |
| `persist` | `{ key, type?, autoRestore? }` | — |
| `debug` | `boolean \| 'auto'` | `'auto'` |
| `onStepChange` / `onComplete` / `onSkip` / `onClose` | callbacks | — |

### Step (essentials)

```ts
{
  target: string;              // CSS selector
  title?: string;
  content?: string | HTMLElement;
  placement?: string;          // Popper placement
  spotlightShape?: 'rect' | 'circle' | 'ellipse' | polygon;
  additionalTargets?: Array<string | { selector; padding?; shape? }>;
  trigger?: 'click' | 'change' | 'blur' | 'hover' | 'drag';
  waitForTarget?: boolean | { timeout?: number };
  beforeStep?: () => void | Promise<void>;
  afterStep?: () => void | Promise<void>;
}
```

## Web Components

```html
<script type="module">import '@guideloop/vanilla/web-component';</script>

<guide-loop id="t" theme="tailwind"
  steps='[{"target":"#btn","title":"Hi","content":"There"}]'>
</guide-loop>
<script>document.getElementById('t').open();</script>
```

Attrs: `steps` (JSON) · `theme` · `z-index` · `debug` · `no-overlay` · `no-keyboard` · `open`  
Events: `close` · `complete` · `skip` · `step-change`  
API: `.open()` · `.close()` · `.next()` · `.prev()` · `.goTo(i)`

Also: `<onboarding-checklist items='[...]' theme="tailwind">`.

## Onboarding checklist

```js
import { createOnboardingChecklist } from '@guideloop/vanilla';

const list = createOnboardingChecklist({
  items: [
    { id: 'tour', title: 'Tour', action: { type: 'tour', steps: [...] } },
    { id: 'docs', title: 'Docs', action: { type: 'link', href: '/docs' } },
  ],
  onComplete: (p) => console.log(p),
});
list.mount(document.querySelector('#sidebar'));
```

## Themes & persist

```js
new GuideLoop({
  steps,
  theme: 'custom',
  customTheme: {
    tooltip: { background: '#1e1e1e', textColor: '#eee', borderRadius: '12px' },
    buttons: { primary: { background: '#7c3aed', textColor: '#fff' } },
  },
  persist: { key: 'welcome', type: 'localStorage', autoRestore: true },
});
```

## More

| Export | |
|--------|--|
| `createTooltip` / `createSpotlight` / `createMaskedOverlay` / `createProgress` | Standalone DOM pieces |
| `saveTourState` / `loadTourState` / … | Persistence helpers (re-export from core) |

Full monorepo docs & demo: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop) · [live demo](https://oznksc.github.io/guideloop/)

MIT © Ozan Kesici
