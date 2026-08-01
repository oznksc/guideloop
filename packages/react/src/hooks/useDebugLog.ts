import { useCallback, useRef, useState } from 'react';
import type { DebugEvent, DebugEventType } from '../components/DebugHUD/types';
import { isDevelopmentEnv } from '@guideloop/core';

const MAX_EVENTS = 50;

export function useDebugLog(enabled: boolean) {
  const seq = useRef(0);
  const [events, setEvents] = useState<DebugEvent[]>([]);

  const push = useCallback(
    (type: DebugEventType, message: string, stepIndex?: number) => {
      if (!enabled) return;
      const entry: DebugEvent = {
        id: ++seq.current,
        ts: Date.now(),
        type,
        message,
        stepIndex,
      };
      setEvents((prev) => {
        const next = [...prev, entry];
        return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
      });
    },
    [enabled]
  );

  const clear = useCallback(() => {
    if (!enabled) return;
    setEvents([]);
  }, [enabled]);

  return { events, push, clear };
}

export function resolveDebugEnabled(debug: boolean | 'auto' | undefined): boolean {
  if (debug === true) return true;
  if (debug === false) return false;
  return isDevelopmentEnv();
}
