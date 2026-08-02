<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { createOnboardingChecklist } from '@guideloop/vanilla';
  import type {
    OnboardingChecklistOptions,
    OnboardingItem,
    OnboardingProgress,
    Theme,
    ThemeConfig,
  } from '@guideloop/vanilla';

  export let items: OnboardingItem[] = [];
  export let title = 'Getting Started';
  export let description: string | undefined = undefined;
  export let completedIds: string[] | undefined = undefined;
  export let defaultCompletedIds: string[] = [];
  export let theme: Theme = 'tailwind';
  export let customTheme: Partial<ThemeConfig> | undefined = undefined;
  export let persist: OnboardingChecklistOptions['persist'] = undefined;
  export let labels: OnboardingChecklistOptions['labels'] = undefined;
  export let collapsible = true;
  export let collapsed: boolean | undefined = undefined;
  export let defaultCollapsed = false;
  export let showProgressBar = true;
  export let emptyState = 'No onboarding steps yet.';
  export let ariaLabel = 'Getting started checklist';
  export let className: string | undefined = undefined;
  export let zIndex = 3000;

  const dispatch = createEventDispatcher<{
    complete: OnboardingProgress;
    progress: OnboardingProgress;
  }>();

  let host: HTMLDivElement;
  let checklist: ReturnType<typeof createOnboardingChecklist> | null = null;

  function mountChecklist() {
    if (!host) return;
    checklist?.destroy();
    checklist = createOnboardingChecklist({
      items,
      title,
      description,
      completedIds,
      defaultCompletedIds,
      theme,
      customTheme,
      persist,
      labels,
      collapsible,
      collapsed,
      defaultCollapsed,
      showProgressBar,
      emptyState,
      ariaLabel,
      className,
      zIndex,
      onComplete: (progress) => dispatch('complete', progress),
      onProgressChange: (progress) => dispatch('progress', progress),
    });
    checklist.mount(host);
  }

  onMount(() => {
    mountChecklist();
  });

  export function completeItem(id: string) {
    checklist?.completeItem(id);
  }

  export function uncompleteItem(id: string) {
    checklist?.uncompleteItem(id);
  }

  export function getProgress() {
    return checklist?.getProgress();
  }

  /** Rebuild checklist UI with current props (e.g. after items change). */
  export function refresh() {
    mountChecklist();
  }

  onDestroy(() => {
    checklist?.destroy();
    checklist = null;
  });
</script>

<div class="guideloop-svelte-onboarding-host" bind:this={host} />

<style>
  .guideloop-svelte-onboarding-host {
    display: contents;
  }
</style>
