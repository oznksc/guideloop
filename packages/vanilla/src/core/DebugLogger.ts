/**
 * Debug logger — ring-buffer for tour debug events.
 * Equivalent to React's useDebugLog hook.
 */

export type DebugEventType =
  | 'open'
  | 'close'
  | 'next'
  | 'prev'
  | 'skip'
  | 'trigger'
  | 'step-change'
  | 'target-missing'
  | 'target-found'
  | 'wait'
  | 'error'
  | 'info';

export interface DebugEvent {
  id: number;
  ts: number;
  type: DebugEventType;
  message: string;
  stepIndex?: number;
}

const MAX_EVENTS = 50;

export interface TargetDebugInfo {
  selector: string;
  found: boolean;
  role: 'primary' | 'additional';
  rect?: { top: number; left: number; width: number; height: number };
  shape?: string;
}

export interface DebugLoggerInstance {
  push: (type: DebugEventType, message: string, stepIndex?: number) => void;
  getEvents: () => DebugEvent[];
  clear: () => void;
  subscribe: (listener: (events: DebugEvent[]) => void) => () => void;
}

export function createDebugLogger(): DebugLoggerInstance {
  let events: DebugEvent[] = [];
  let seq = 0;
  const listeners = new Set<(events: DebugEvent[]) => void>();

  function notify() {
    for (const listener of listeners) {
      listener(events);
    }
  }

  return {
    push(type, message, stepIndex) {
      const entry: DebugEvent = {
        id: ++seq,
        ts: Date.now(),
        type,
        message,
        stepIndex,
      };
      events = [...events, entry];
      if (events.length > MAX_EVENTS) {
        events = events.slice(events.length - MAX_EVENTS);
      }
      notify();
    },

    getEvents: () => events,

    clear() {
      events = [];
      notify();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function resolveDebugEnabled(debug: boolean | 'auto' | undefined): boolean {
  if (debug === true) return true;
  if (debug === false) return false;
  // 'auto' or undefined → enabled in development
  return (
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV !== 'production'
  );
}
