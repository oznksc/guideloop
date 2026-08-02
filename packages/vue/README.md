# @guideloop/vue

Vue 3 guided tours & onboarding. Powered by [`@guideloop/vanilla`](https://www.npmjs.com/package/@guideloop/vanilla) + [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

```bash
npm i @guideloop/vue
```

Peer: `vue` ≥3.2.

## GuideLoop

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { GuideLoop, type Step } from '@guideloop/vue';

const open = ref(false);
const steps: Step[] = [
  { target: '#cta', title: 'Welcome', content: 'Start here.', placement: 'bottom' },
];
</script>

<template>
  <button @click="open = true">Start tour</button>
  <GuideLoop
    :steps="steps"
    v-model:is-open="open"
    theme="tailwind"
    @complete="() => {}"
    @step-change="(step) => console.log(step)"
  />
</template>
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

Supports `v-model:is-open` for controlled open state.

### Events

`close` · `complete` · `skip` · `stepChange` · `update:isOpen`

### Methods (via template ref)

`next()` · `prev()` · `goTo(i)` · `skip()` · `close()`

## Onboarding checklist

```vue
<OnboardingChecklist
  :items="items"
  theme="tailwind"
  @complete="onAllDone"
/>
```

## Progress

```vue
<Progress :current="2" :total="5" theme="material" />
```

## Docs

Monorepo: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop)

MIT
