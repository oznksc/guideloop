import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { createProgress } from '@guideloop/vanilla';
import type { Theme, ThemeConfig } from '@guideloop/vanilla';

/**
 * Standalone progress dots indicator.
 */
export const Progress = defineComponent({
  name: 'Progress',
  props: {
    current: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 1,
    },
    theme: {
      type: String as PropType<Theme>,
      default: 'tailwind',
    },
    customTheme: {
      type: Object as PropType<Partial<ThemeConfig>>,
      default: undefined,
    },
  },
  setup(props) {
    const host = ref<HTMLDivElement | null>(null);
    let progress: ReturnType<typeof createProgress> | null = null;

    onMounted(() => {
      const el = host.value;
      if (!el) return;
      progress = createProgress({
        current: props.current,
        total: props.total,
        theme: props.theme,
        customTheme: props.customTheme,
      });
      progress.mount(el);
    });

    watch(
      () => [props.current, props.total] as const,
      ([current, total]) => {
        progress?.update(current, total);
      }
    );

    onBeforeUnmount(() => {
      progress?.destroy();
      progress = null;
    });

    return () =>
      h('div', {
        ref: host,
        class: 'guideloop-vue-progress-host',
        style: { display: 'contents' },
      });
  },
});

export default Progress;
