'use client';

import React, { useEffect, useState } from 'react';
import { buildSelector, resolvePickTarget } from './selectors';

interface Props {
  active: boolean;
  onPick: (selector: string, el: HTMLElement) => void;
}

export const PickerOverlay: React.FC<Props> = ({ active, onPick }) => {
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
      setRing({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        label: buildSelector(target),
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = resolvePickTarget(event.clientX, event.clientY);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const selector = buildSelector(target);
      if (selector) onPick(selector, target);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (resolvePickTarget(event.clientX, event.clientY)) {
        event.preventDefault();
      }
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('mousedown', onPointerDown, true);
    const prev = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.body.style.cursor = prev;
    };
  }, [active, onPick]);

  if (!active || !ring) return null;

  return (
    <>
      <div
        className="guideloop-pick-ring"
        style={{
          top: ring.top - 2,
          left: ring.left - 2,
          width: Math.max(ring.width + 4, 4),
          height: Math.max(ring.height + 4, 4),
        }}
      />
      <div
        className="guideloop-pick-label"
        style={{
          top: Math.max(8, ring.top - 28),
          left: Math.max(8, ring.left),
        }}
      >
        {ring.label}
      </div>
    </>
  );
};
