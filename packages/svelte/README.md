# @guideloop/svelte

Svelte guided tours & onboarding. Powered by [`@guideloop/vanilla`](https://www.npmjs.com/package/@guideloop/vanilla) + [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

```bash
npm i @guideloop/svelte
```

Peer: `svelte` ^3.59 / ^4 / ^5.

## GuideLoop

```svelte
<script lang="ts">
  import { GuideLoop } from '@guideloop/svelte';
  import type { Step } from '@guideloop/svelte';

  let open = false;
  const steps: Step[] = [
    { target: '#cta', title: 'Welcome', content: 'Start here.', placement: 'bottom' },
  ];
</script>

<button on:click={() => (open = true)}>Start tour</button>

<GuideLoop
  steps={steps}
  bind:isOpen={open}
  theme="tailwind"
  on:complete={() => console.log('done')}
  on:close={() => console.log('closed')}
  on:stepchange={({ detail }) => console.log(detail.step)}
/>
```

### Props

| Prop | Type | Default |
|------|------|---------|
| `steps` | `Step[]` | required |
| `isOpen` | `boolean` | `false` |
| `theme` | `tailwind \| material \| antd \| custom` | `tailwind` |
| `customTheme` | `Partial<ThemeConfig>` | — |
| `keyboard` / `overlay` / `scrollSmooth` | `boolean` | `true` |
| `persist` | `PersistConfig` | — |
| `debug` | `boolean \| 'auto'` | `'auto'` |

### Events

`close` · `complete` · `skip` · `stepchange` (`{ step }`)

### Methods (component instance)

`next()` · `prev()` · `goTo(i)` · `skip()` · `close()`

## OnboardingChecklist

```svelte
<script>
  import { OnboardingChecklist } from '@guideloop/svelte';
</script>

<OnboardingChecklist
  items={[
    { id: 'tour', title: 'Take a tour', action: { type: 'tour', steps: [...] } },
    { id: 'docs', title: 'Docs', action: { type: 'link', href: '/docs' } },
  ]}
  theme="tailwind"
  on:complete={({ detail }) => console.log(detail)}
/>
```

## Progress

```svelte
<script>
  import { Progress } from '@guideloop/svelte';
</script>

<Progress current={2} total={5} theme="material" />
```

## Docs

Monorepo & demos: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop)

MIT
