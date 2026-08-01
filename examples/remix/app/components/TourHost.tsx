import { useCallback, useMemo, useState } from 'react';
import { GuideLoop, type Step } from '@guideloop/react';
import { TOUR_KEY } from '../tour';

type Props = {
  steps: Step[];
  initialStep?: number;
  startLabel?: string;
};

export function TourHost({
  steps,
  initialStep = 0,
  startLabel = 'Start tour',
}: Props) {
  const [open, setOpen] = useState(false);

  const persist = useMemo(
    () => ({
      key: TOUR_KEY,
      type: 'sessionStorage' as const,
      autoRestore: true,
    }),
    []
  );

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button id="remix-start" className="primary" type="button" onClick={() => setOpen(true)}>
        {startLabel}
      </button>
      <GuideLoop
        steps={steps}
        isOpen={open}
        onClose={close}
        onComplete={close}
        initialStep={initialStep}
        theme="material"
        persist={persist}
        debug="auto"
      />
    </>
  );
}
