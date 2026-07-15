import { useEffect, useRef } from 'react';
import type { StepTrigger } from '../components/GuideLoop/types';

const EVENT_MAP: Record<StepTrigger, string> = {
  click: 'click',
  change: 'change',
  blur: 'blur',
  hover: 'mouseenter',
  drag: 'dragend',
};

interface UseElementTriggerProps {
  enabled: boolean;
  targetSelector: string;
  trigger?: StepTrigger;
  onTrigger: () => void;
}

export const useElementTrigger = ({
  enabled,
  targetSelector,
  trigger,
  onTrigger,
}: UseElementTriggerProps) => {
  const handlerRef = useRef(onTrigger);
  handlerRef.current = onTrigger;

  useEffect(() => {
    if (!enabled || !trigger || !targetSelector) return;

    const eventType = EVENT_MAP[trigger];
    if (!eventType) return;

    const element = document.querySelector(targetSelector);
    if (!element) {
      console.warn(`GuideLoop: Target element '${targetSelector}' not found for trigger '${trigger}'`);
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      handlerRef.current();
    };

    element.addEventListener(eventType, handler);
    return () => {
      element.removeEventListener(eventType, handler);
    };
  }, [enabled, trigger, targetSelector]);
};
