<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { GuideLoop as TourEngine } from '@guideloop/vanilla';
  import type {
    AnimationConfig,
    ButtonLabels,
    PersistConfig,
    Step,
    Theme,
    ThemeConfig,
  } from '@guideloop/vanilla';

  export let steps: Step[] = [];
  export let isOpen = false;
  export let theme: Theme = 'tailwind';
  export let customTheme: Partial<ThemeConfig> | undefined = undefined;
  export let initialStep = 0;
  export let overlay = true;
  export let keyboard = true;
  export let scrollSmooth = true;
  export let spotlightPadding = 8;
  export let animations: AnimationConfig | undefined = undefined;
  export let zIndex = 2000;
  export let defaultButtonLabels: ButtonLabels | undefined = undefined;
  export let persist: PersistConfig | undefined = undefined;
  export let debug: boolean | 'auto' | undefined = undefined;

  const dispatch = createEventDispatcher<{
    close: void;
    complete: void;
    skip: void;
    stepchange: { step: number };
  }>();

  let engine: TourEngine | null = null;
  let lastOpen = false;
  let starting = false;

  function destroyEngine() {
    if (!engine) return;
    engine.destroy();
    engine = null;
  }

  async function openTour() {
    if (engine || starting) return;
    starting = true;
    try {
      engine = new TourEngine({
        steps,
        theme,
        customTheme,
        initialStep,
        overlay,
        keyboard,
        scrollSmooth,
        spotlightPadding,
        animations,
        zIndex,
        defaultButtonLabels,
        persist,
        debug,
        onClose: () => {
          dispatch('close');
          // keep controlled prop in sync when parent binds isOpen
          isOpen = false;
          lastOpen = false;
          destroyEngine();
        },
        onComplete: () => {
          dispatch('complete');
        },
        onSkip: () => {
          dispatch('skip');
        },
        onStepChange: (step) => {
          dispatch('stepchange', { step });
        },
      });
      await engine.start();
    } finally {
      starting = false;
    }
  }

  function closeTour() {
    if (!engine) {
      isOpen = false;
      lastOpen = false;
      return;
    }
    engine.close();
  }

  $: {
    if (isOpen && !lastOpen) {
      lastOpen = true;
      void openTour();
    } else if (!isOpen && lastOpen) {
      lastOpen = false;
      closeTour();
    }
  }

  export async function next() {
    await engine?.next();
  }

  export async function prev() {
    await engine?.prev();
  }

  export async function goTo(index: number) {
    await engine?.goTo(index);
  }

  export function skip() {
    engine?.skip();
  }

  export function close() {
    isOpen = false;
    closeTour();
  }

  onDestroy(() => {
    destroyEngine();
  });
</script>
