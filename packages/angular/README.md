# @guideloop/angular

Angular guided tours & onboarding. Powered by [`@guideloop/vanilla`](https://www.npmjs.com/package/@guideloop/vanilla) + [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

```bash
npm i @guideloop/angular
```

Peers: `@angular/core` & `@angular/common` ≥15.

## GuideLoop

```ts
import { Component } from '@angular/core';
import { GuideLoopComponent, type Step } from '@guideloop/angular';

@Component({
  standalone: true,
  imports: [GuideLoopComponent],
  template: `
    <button (click)="open = true">Start tour</button>
    <guideloop-tour
      [steps]="steps"
      [isOpen]="open"
      theme="tailwind"
      (closed)="open = false"
      (complete)="onDone()"
      (stepChange)="onStep($event)"
    />
  `,
})
export class AppComponent {
  open = false;
  steps: Step[] = [
    { target: '#cta', title: 'Welcome', content: 'Start here.', placement: 'bottom' },
  ];
  onDone() {}
  onStep(step: number) {}
}
```

### Inputs

| Input | Type | Default |
|-------|------|---------|
| `steps` | `Step[]` | required |
| `isOpen` | `boolean` | `false` |
| `theme` | `tailwind \| material \| antd \| custom` | `tailwind` |
| `customTheme` | `Partial<ThemeConfig>` | — |
| `keyboard` / `overlay` / `scrollSmooth` | `boolean` | `true` |
| `persist` | `PersistConfig` | — |
| `debug` | `boolean \| 'auto'` | `'auto'` |

### Outputs

`closed` · `complete` · `skip` · `stepChange`

### Methods

`next()` · `prev()` · `goTo(i)` · `skipTour()` · `close()`

## Onboarding checklist

```html
<guideloop-onboarding-checklist
  [items]="items"
  theme="tailwind"
  (completed)="onAllDone($event)"
/>
```

## Progress

```html
<guideloop-progress [current]="2" [total]="5" theme="material" />
```

## Docs

Monorepo: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop)

MIT
