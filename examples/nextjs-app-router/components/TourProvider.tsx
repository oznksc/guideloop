'use client';

import { useCallback, useMemo, useState } from 'react';
import { GuideLoop, type Step } from '@guideloop/react';
import { TOUR_PERSIST_KEY } from '../lib/tour';

type Props = {
  steps: Step[];
  initialStep?: number;
  /** When true, opens immediately (useful after autoRestore on a new page). */
  startOpen?: boolean;
};

/**
 * Client boundary for GuideLoop. Server Components can render this island
 * without importing DOM-only tour code into the RSC graph beyond this file.
 */
export function TourProvider({ steps, initialStep = 0, startOpen = false }: Props) {
  const [open, setOpen] = useState(startOpen);

  const persist = useMemo(
    () =>
      ({
        key: TOUR_PERSIST_KEY,
        type: 'sessionStorage' as const,
        autoRestore: true,
      }),
    []
  );

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        id="start-tour"
        type="button"
        className="primary"
        onClick={() => setOpen(true)}
      >
        Start multi-page tour
      </button>
      <GuideLoop
        steps={steps}
        isOpen={open}
        onClose={close}
        onComplete={close}
        initialStep={initialStep}
        theme="tailwind"
        persist={persist}
        debug="auto"
      />
    </>
  );
}
