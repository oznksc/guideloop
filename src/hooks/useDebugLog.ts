import { useCallback, useRef, useState } from 'react';
import type { DebugEvent, DebugEventType } from '../components/DebugHUD/types';
import { isDevelopmentEnv } from '../utils/env';

const MAX_EVENTS = 50;

/**
 * Ring-buffer event log for the Debug HUD.
 * Disabled instances no-op so production paths stay cheap.
 */
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

/** Resolve whether the debug HUD should render. */
export function resolveDebugEnabled(debug: boolean | 'auto' | undefined): boolean {
  if (debug === true) return true;
  if (debug === false) return false;
  // 'auto' or undefined → only when explicitly in development
  // (not 'test' / 'production', so Jest and prod builds stay clean)
  return isDevelopmentEnv();
}
