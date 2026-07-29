import React, { useEffect, useState } from 'react';
import { buildSelector, resolvePickTarget } from '../lib/selectors';

type Props = {
  active: boolean;
  onPick: (selector: string, el: HTMLElement) => void;
};

/**
 * Capture-phase hover/click picker over the demo canvas only.
 * Uses elementsFromPoint so the highlight ring never blocks picks.
 */
export function PickerOverlay({ active, onPick }: Props) {
  const [ring, setRing] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!active) {
      setRing(null);
      return undefined;
    }

    const onMove = (event: MouseEvent) => {
      const target = resolvePickTarget(event.clientX, event.clientY);
      if (!target) {
        setRing(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      const selector = buildSelector(target);
      setRing({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        label: selector,
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = resolvePickTarget(event.clientX, event.clientY);
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();
      const selector = buildSelector(target);
      if (selector) {
        onPick(selector, target);
      }
    };

    // Prevent accidental navigation / focus while picking
    const onPointerDown = (event: MouseEvent) => {
      const target = resolvePickTarget(event.clientX, event.clientY);
      if (target) {
        event.preventDefault();
      }
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.body.style.cursor = '';
    };
  }, [active, onPick]);

  if (!active || !ring) return null;

  return (
    <>
      <div
        className="pick-ring"
        style={{
          top: ring.top - 2,
          left: ring.left - 2,
          width: Math.max(ring.width + 4, 4),
          height: Math.max(ring.height + 4, 4),
        }}
      />
      <div
        className="pick-label"
        style={{
          top: Math.max(8, ring.top - 28),
          left: Math.max(8, ring.left),
        }}
      >
        {ring.label}
      </div>
    </>
  );
}
