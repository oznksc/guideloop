<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./guideloop-logo.svg">
    <img alt="GuideLoop" src="./guideloop-logo.svg" width="520">
  </picture>
</p>

<p align="center">
  Product tours & onboarding for <strong>React</strong>, <strong>Vue</strong>, <strong>Svelte</strong>, <strong>Angular</strong>, <strong>vanilla JS</strong>, and <strong>Web Components</strong>.
</p>

<p align="center">
  <a href="https://oznksc.github.io/guideloop/"><strong>Live demo →</strong></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@guideloop/react"><img alt="@guideloop/react" src="https://img.shields.io/npm/v/@guideloop/react.svg?label=%40guideloop%2Freact&color=cb3837" /></a>
  <a href="https://www.npmjs.com/package/@guideloop/vue"><img alt="@guideloop/vue" src="https://img.shields.io/npm/v/@guideloop/vue.svg?label=%40guideloop%2Fvue&color=cb3837" /></a>
  <a href="https://www.npmjs.com/package/@guideloop/svelte"><img alt="@guideloop/svelte" src="https://img.shields.io/npm/v/@guideloop/svelte.svg?label=%40guideloop%2Fsvelte&color=cb3837" /></a>
  <a href="https://www.npmjs.com/package/@guideloop/angular"><img alt="@guideloop/angular" src="https://img.shields.io/npm/v/@guideloop/angular.svg?label=%40guideloop%2Fangular&color=cb3837" /></a>
  <a href="https://www.npmjs.com/package/@guideloop/vanilla"><img alt="@guideloop/vanilla" src="https://img.shields.io/npm/v/@guideloop/vanilla.svg?label=%40guideloop%2Fvanilla&color=cb3837" /></a>
  <a href="https://www.npmjs.com/package/@guideloop/core"><img alt="@guideloop/core" src="https://img.shields.io/npm/v/@guideloop/core.svg?label=%40guideloop%2Fcore&color=cb3837" /></a>
  <br />
  <a href="https://github.com/oznksc/guideloop/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/oznksc/guideloop/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6.svg?logo=typescript&logoColor=white" /></a>
</p>

## Packages

| Package | Use when | Install |
|---------|----------|---------|
| [`@guideloop/react`](./packages/react) | React 16.8–19 | `npm i @guideloop/react` |
| [`@guideloop/vue`](./packages/vue) | Vue 3.2+ | `npm i @guideloop/vue` |
| [`@guideloop/svelte`](./packages/svelte) | Svelte 3.59+ / 4 / 5 | `npm i @guideloop/svelte` |
| [`@guideloop/angular`](./packages/angular) | Angular ≥15 | `npm i @guideloop/angular` |
| [`@guideloop/vanilla`](./packages/vanilla) | Any stack / no framework | `npm i @guideloop/vanilla` |
| [`@guideloop/core`](./packages/core) | Custom bindings only | `npm i @guideloop/core` |

Framework packages pull in `core` (and `vanilla` for Vue/Svelte/Angular engines) automatically.

## Quick start

**React**

```tsx
import { GuideLoop } from '@guideloop/react';

<GuideLoop
  steps={[{ target: '#cta', title: 'Welcome', content: 'Start here.' }]}
  isOpen={open}
  onClose={() => setOpen(false)}
  theme="tailwind"
/>
```

**Vue**

```vue
<script setup>
import { ref } from 'vue';
import { GuideLoop } from '@guideloop/vue';
const open = ref(false);
</script>

<template>
  <button @click="open = true">Start</button>
  <GuideLoop
    :steps="[{ target: '#cta', title: 'Welcome', content: 'Start here.' }]"
    v-model:is-open="open"
    theme="tailwind"
    @complete="() => {}"
  />
</template>
```

**Svelte**

```svelte
<script>
  import { GuideLoop } from '@guideloop/svelte';
  let open = false;
</script>

<button on:click={() => (open = true)}>Start</button>
<GuideLoop
  steps={[{ target: '#cta', title: 'Welcome', content: 'Start here.' }]}
  bind:isOpen={open}
  theme="tailwind"
  on:complete={() => {}}
/>
```

**Angular**

```ts
import { GuideLoopComponent, type Step } from '@guideloop/angular';

@Component({
  standalone: true,
  imports: [GuideLoopComponent],
  template: `
    <button (click)="open = true">Start</button>
    <guideloop-tour
      [steps]="steps"
      [isOpen]="open"
      theme="tailwind"
      (closed)="open = false"
    />
  `,
})
export class AppComponent {
  open = false;
  steps: Step[] = [{ target: '#cta', title: 'Welcome', content: 'Start here.' }];
}
```

**Vanilla**

```js
import { GuideLoop } from '@guideloop/vanilla';

const tour = new GuideLoop({
  steps: [{ target: '#cta', title: 'Welcome', content: 'Start here.' }],
  theme: 'tailwind',
});
await tour.start();
```

**Web Component**

```html
<script type="module">import '@guideloop/vanilla/web-component';</script>
<guide-loop id="t" theme="tailwind"
  steps='[{"target":"#cta","title":"Welcome","content":"Start here."}]'>
</guide-loop>
<script>document.getElementById('t').open();</script>
```

## Highlights

- Themes: `tailwind` · `material` · `antd` · `custom`
- Multi-target spotlight · shapes (`rect` / `circle` / `ellipse` / polygon)
- Keyboard · focus trap · ARIA · scroll-into-view
- `waitForTarget` · element triggers · multi-page `persist`
- Onboarding checklist · Debug HUD · React Tour Builder (`/builder`)

## React extras

| Entry | Purpose |
|-------|---------|
| `@guideloop/react` | Components & hooks |
| `@guideloop/react/builder` | Dev-only Tour Builder (gate out of production) |
| `@guideloop/react/types` | RSC-safe types + storage |

```tsx
// Next.js — keep builder out of production
if (process.env.NODE_ENV === 'development') {
  const { TourBuilder } = await import('@guideloop/react/builder');
  // mount <TourBuilder />
}
```

```ts
// RSC-safe steps module
import type { Step } from '@guideloop/react/types';
```

## Examples

```bash
npm run build
cd examples/vite-react && npm i && npm run dev
```

| Example | Stack |
|---------|--------|
| [`nextjs-app-router`](./examples/nextjs-app-router) | Next.js App Router + persist |
| [`vite-react`](./examples/vite-react) | Shapes / multi-spotlight / debug |
| [`remix`](./examples/remix) | Multi-route resume |
| [`react-native-web`](./examples/react-native-web) | RN Web |
| [`tour-builder`](./examples/tour-builder) | Visual builder lab |
| [`vanilla`](./examples/vanilla) | Static HTML |

## Docs & more

- Package READMEs: [react](./packages/react) · [vanilla](./packages/vanilla) · [core](./packages/core)
- [CHANGELOG](./CHANGELOG.md) · [CONTRIBUTING](./CONTRIBUTING.md) · [AGENTS.md](./AGENTS.md)
- Browsers: Chrome / Firefox / Edge 90+, Safari 15+

## License

MIT © [Ozan Kesici](https://github.com/oznksc)
