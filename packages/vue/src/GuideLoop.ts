import {
  defineComponent,
  onBeforeUnmount,
  watch,
  type PropType,
} from 'vue';
import { GuideLoop as TourEngine } from '@guideloop/vanilla';
import type {
  AnimationConfig,
  ButtonLabels,
  PersistConfig,
  Step,
  Theme,
  ThemeConfig,
} from '@guideloop/vanilla';

/**
 * Vue 3 wrapper around the vanilla tour engine.
 *
 * @example
 * ```vue
 * <GuideLoop
 *   :steps="steps"
 *   v-model:is-open="open"
 *   theme="tailwind"
 *   @complete="onDone"
 * />
 * ```
 */
export const GuideLoop = defineComponent({
  name: 'GuideLoop',
  props: {
    steps: {
      type: Array as PropType<Step[]>,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String as PropType<Theme>,
      default: 'tailwind',
    },
    customTheme: {
      type: Object as PropType<Partial<ThemeConfig>>,
      default: undefined,
    },
    initialStep: {
      type: Number,
      default: 0,
    },
    overlay: {
      type: Boolean,
      default: true,
    },
    keyboard: {
      type: Boolean,
      default: true,
    },
    scrollSmooth: {
      type: Boolean,
      default: true,
    },
    spotlightPadding: {
      type: Number,
      default: 8,
    },
    animations: {
      type: Object as PropType<AnimationConfig>,
      default: undefined,
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    defaultButtonLabels: {
      type: Object as PropType<ButtonLabels>,
      default: undefined,
    },
    persist: {
      type: Object as PropType<PersistConfig>,
      default: undefined,
    },
    debug: {
      type: [Boolean, String] as PropType<boolean | 'auto'>,
      default: undefined,
    },
  },
  emits: {
    'update:isOpen': (_value: boolean) => true,
    close: () => true,
    complete: () => true,
    skip: () => true,
    stepChange: (_step: number) => true,
  },
  setup(props, { emit, expose }) {
    let engine: TourEngine | null = null;
    let starting = false;
    let lastOpen = false;

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
          steps: props.steps,
          theme: props.theme,
          customTheme: props.customTheme,
          initialStep: props.initialStep,
          overlay: props.overlay,
          keyboard: props.keyboard,
          scrollSmooth: props.scrollSmooth,
          spotlightPadding: props.spotlightPadding,
          animations: props.animations,
          zIndex: props.zIndex,
          defaultButtonLabels: props.defaultButtonLabels,
          persist: props.persist,
          debug: props.debug,
          onClose: () => {
            emit('close');
            emit('update:isOpen', false);
            lastOpen = false;
            destroyEngine();
          },
          onComplete: () => {
            emit('complete');
          },
          onSkip: () => {
            emit('skip');
          },
          onStepChange: (step) => {
            emit('stepChange', step);
          },
        });
        await engine.start();
      } finally {
        starting = false;
      }
    }

    function closeTour() {
      if (!engine) return;
      engine.close();
    }

    async function next() {
      await engine?.next();
    }

    async function prev() {
      await engine?.prev();
    }

    async function goTo(index: number) {
      await engine?.goTo(index);
    }

    function skipTour() {
      engine?.skip();
    }

    function close() {
      emit('update:isOpen', false);
      closeTour();
    }

    watch(
      () => props.isOpen,
      (open) => {
        if (open && !lastOpen) {
          lastOpen = true;
          void openTour();
        } else if (!open && lastOpen) {
          lastOpen = false;
          closeTour();
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      destroyEngine();
    });

    expose({
      next,
      prev,
      goTo,
      skip: skipTour,
      close,
    });

    return () => null;
  },
});

export default GuideLoop;
