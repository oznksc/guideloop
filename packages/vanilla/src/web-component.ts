/**
 * @guideloop/vanilla/web-component
 *
 * Registers <guide-loop> and <onboarding-checklist> custom elements.
 *
 * Usage:
 *   import '@guideloop/vanilla/web-component';
 *
 *   <guide-loop
 *     steps='[{"target":"#btn","title":"Click here","content":"This is the button"}]'
 *     theme="tailwind"
 *   ></guide-loop>
 */

import { GuideLoop } from './core/GuideLoop';
import { createOnboardingChecklist } from './core/OnboardingChecklist';
import type { Step, OnboardingItem } from './core/types';

// ─── <guide-loop> ───

class GuideLoopElement extends HTMLElement {
  private _tour: GuideLoop | null = null;
  static get observedAttributes() {
    return ['open', 'theme', 'z-index', 'debug'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this._applyFromAttributes();
  }

  disconnectedCallback() {
    this._destroy();
  }

  attributeChangedCallback(_name: string) {
    if (this.isConnected) {
      this._applyFromAttributes();
    }
  }

  // Public JS API
  open(): void {
    void this._startTour();
  }

  close() {
    this._tour?.close();
    this._tour = null;
  }

  next() {
    this._tour?.next();
  }

  prev() {
    this._tour?.prev();
  }

  goTo(step: number) {
    this._tour?.goTo(step);
  }

  get tour(): GuideLoop | null {
    return this._tour;
  }

  private _applyFromAttributes() {
    const hasOpen = this.hasAttribute('open');

    if (hasOpen && !this._tour) {
      this._startTour();
    } else if (!hasOpen && this._tour) {
      this._tour.close();
      this._tour = null;
    }
  }

  private async _startTour(): Promise<void> {
    if (this._tour) return;
    const stepsAttr = this.getAttribute('steps');
    if (!stepsAttr) return;

    let steps: Step[];
    try {
      steps = JSON.parse(stepsAttr);
    } catch {
      console.error('<guide-loop>: Invalid steps JSON');
      return;
    }

    const themeAttr = this.getAttribute('theme');
    const theme =
      themeAttr === 'material' ||
      themeAttr === 'antd' ||
      themeAttr === 'custom' ||
      themeAttr === 'tailwind'
        ? themeAttr
        : 'tailwind';
    const zIndex = parseInt(this.getAttribute('z-index') || '2000', 10);
    const debug = this.getAttribute('debug');
    const overlay = !this.hasAttribute('no-overlay');
    const keyboard = !this.hasAttribute('no-keyboard');

    this._tour = new GuideLoop({
      steps,
      theme,
      zIndex,
      overlay,
      keyboard,
      debug:
        debug === 'auto'
          ? 'auto'
          : debug === 'true'
            ? true
            : debug === 'false'
              ? false
              : undefined,
      onClose: () => {
        this._tour = null;
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      },
      onComplete: () => {
        this.dispatchEvent(new CustomEvent('complete', { bubbles: true }));
      },
      onSkip: () => {
        this.dispatchEvent(new CustomEvent('skip', { bubbles: true }));
      },
      onStepChange: (step) => {
        this.dispatchEvent(
          new CustomEvent('step-change', { detail: { step }, bubbles: true })
        );
      },
    });

    await this._tour.start();
  }

  private _destroy() {
    this._tour?.destroy();
    this._tour = null;
  }
}

// ─── <onboarding-checklist> ───

class OnboardingChecklistElement extends HTMLElement {
  private _checklist: ReturnType<typeof createOnboardingChecklist> | null = null;

  static get observedAttributes() {
    return ['items', 'title', 'theme', 'z-index'];
  }

  connectedCallback() {
    this._render();
  }

  disconnectedCallback() {
    this._checklist?.destroy();
    this._checklist = null;
  }

  attributeChangedCallback(_name: string) {
    if (this.isConnected) {
      this._checklist?.destroy();
      this._render();
    }
  }

  // Public JS API
  completeItem(id: string) {
    this._checklist?.completeItem(id);
  }

  uncompleteItem(id: string) {
    this._checklist?.uncompleteItem(id);
  }

  getProgress() {
    return this._checklist?.getProgress();
  }

  private _render() {
    this._checklist?.destroy();

    const itemsAttr = this.getAttribute('items');
    if (!itemsAttr) return;

    let items: OnboardingItem[];
    try {
      items = JSON.parse(itemsAttr);
    } catch {
      console.error('<onboarding-checklist>: Invalid items JSON');
      return;
    }

    const title = this.getAttribute('title') || 'Getting Started';
    const themeAttr = this.getAttribute('theme');
    const theme =
      themeAttr === 'material' ||
      themeAttr === 'antd' ||
      themeAttr === 'custom' ||
      themeAttr === 'tailwind'
        ? themeAttr
        : 'tailwind';
    const zIndex = parseInt(this.getAttribute('z-index') || '3000', 10);

    this._checklist = createOnboardingChecklist({
      items,
      title,
      theme,
      zIndex,
      onComplete: (progress) => {
        this.dispatchEvent(
          new CustomEvent('complete', { detail: progress, bubbles: true })
        );
      },
      onProgressChange: (progress) => {
        this.dispatchEvent(
          new CustomEvent('progress', { detail: progress, bubbles: true })
        );
      },
    });

    this._checklist.mount(this);
  }
}

// ─── Register custom elements ───

export function registerElements() {
  if (typeof customElements === 'undefined') return;

  if (!customElements.get('guide-loop')) {
    customElements.define('guide-loop', GuideLoopElement);
  }
  if (!customElements.get('onboarding-checklist')) {
    customElements.define('onboarding-checklist', OnboardingChecklistElement);
  }
}

// Auto-register on import
registerElements();
