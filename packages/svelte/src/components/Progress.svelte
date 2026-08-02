<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createProgress } from '@guideloop/vanilla';
  import type { Theme, ThemeConfig } from '@guideloop/vanilla';

  export let current = 1;
  export let total = 1;
  export let theme: Theme = 'tailwind';
  export let customTheme: Partial<ThemeConfig> | undefined = undefined;

  let host: HTMLDivElement;
  let progress: ReturnType<typeof createProgress> | null = null;

  onMount(() => {
    progress = createProgress({
      current,
      total,
      theme,
      customTheme,
    });
    progress.mount(host);
  });

  $: if (progress) {
    progress.update(current, total);
  }

  onDestroy(() => {
    progress?.destroy();
    progress = null;
  });
</script>

<div class="guideloop-svelte-progress-host" bind:this={host} />

<style>
  .guideloop-svelte-progress-host {
    display: contents;
  }
</style>
