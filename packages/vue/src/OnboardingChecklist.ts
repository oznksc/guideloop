import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
} from 'vue';
import { createOnboardingChecklist } from '@guideloop/vanilla';
import type {
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
  Theme,
  ThemeConfig,
} from '@guideloop/vanilla';

/**
 * Vue host for the vanilla onboarding checklist UI.
 */
export const OnboardingChecklist = defineComponent({
  name: 'OnboardingChecklist',
  props: {
    items: {
      type: Array as PropType<OnboardingItem[]>,
      required: true,
    },
    title: {
      type: String,
      default: 'Getting Started',
    },
    description: {
      type: String,
      default: undefined,
    },
    completedIds: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
    defaultCompletedIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    theme: {
      type: String as PropType<Theme>,
      default: 'tailwind',
    },
    customTheme: {
      type: Object as PropType<Partial<ThemeConfig>>,
      default: undefined,
    },
    persist: {
      type: Object as PropType<OnboardingChecklistOptions['persist']>,
      default: undefined,
    },
    labels: {
      type: Object as PropType<OnboardingChecklistOptions['labels']>,
      default: undefined,
    },
    collapsible: {
      type: Boolean,
      default: true,
    },
    collapsed: {
      type: Boolean,
      default: undefined,
    },
    defaultCollapsed: {
      type: Boolean,
      default: false,
    },
    showProgressBar: {
      type: Boolean,
      default: true,
    },
    emptyState: {
      type: String,
      default: 'No onboarding steps yet.',
    },
    ariaLabel: {
      type: String,
      default: 'Getting started checklist',
    },
    className: {
      type: String,
      default: undefined,
    },
    zIndex: {
      type: Number,
      default: 3000,
    },
  },
  emits: {
    complete: (_progress: OnboardingProgress) => true,
    progress: (_progress: OnboardingProgress) => true,
  },
  setup(props, { emit, expose }) {
    const host = ref<HTMLDivElement | null>(null);
    let checklist: ReturnType<typeof createOnboardingChecklist> | null = null;

    function mountChecklist() {
      const el = host.value;
      if (!el) return;
      checklist?.destroy();
      checklist = createOnboardingChecklist({
        items: props.items,
        title: props.title,
        description: props.description,
        completedIds: props.completedIds,
        defaultCompletedIds: props.defaultCompletedIds,
        theme: props.theme,
        customTheme: props.customTheme,
        persist: props.persist,
        labels: props.labels,
        collapsible: props.collapsible,
        collapsed: props.collapsed,
        defaultCollapsed: props.defaultCollapsed,
        showProgressBar: props.showProgressBar,
        emptyState: props.emptyState,
        ariaLabel: props.ariaLabel,
        className: props.className,
        zIndex: props.zIndex,
        onComplete: (p) => emit('complete', p),
        onProgressChange: (p) => emit('progress', p),
      });
      checklist.mount(el);
    }

    onMounted(() => {
      mountChecklist();
    });

    onBeforeUnmount(() => {
      checklist?.destroy();
      checklist = null;
    });

    expose({
      completeItem(id: string) {
        checklist?.completeItem(id);
      },
      uncompleteItem(id: string) {
        checklist?.uncompleteItem(id);
      },
      getProgress() {
        return checklist?.getProgress();
      },
      refresh() {
        mountChecklist();
      },
    });

    return () =>
      h('div', {
        ref: host,
        class: 'guideloop-vue-onboarding-host',
        style: { display: 'contents' },
      });
  },
});

export default OnboardingChecklist;
