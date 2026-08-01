"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambient product-tour demo for the hero.
 * Auto-steps a GuideLoop-style spotlight across hero targets;
 * pointer near a target steals focus (interactive spotlight).
 */

interface SpotRect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

interface SpotTarget {
  id: string;
  label: string;
  selector: string;
}

const TARGETS: SpotTarget[] = [
  {
    id: "intro",
    label: "target: .hero-intro",
    // Title + description share one bounding box (union of children)
    selector: "[data-hero-spot='intro']",
  },
  {
    id: "install",
    label: "target: #install · copy",
    selector: "[data-hero-spot='install']",
  },
  {
    id: "stats",
    label: "target: .hero-stats",
    selector: "[data-hero-spot='stats']",
  },
];

const PAD = 10;
const STEP_MS = 3200;
const LERP = 0.1;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function measure(
  el: Element,
  host: DOMRect,
): SpotRect {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const radius =
    parseFloat(cs.borderRadius) ||
    (cs.borderRadius.includes("%") ? Math.min(r.width, r.height) / 2 : 8);

  return {
    x: r.left - host.left - PAD,
    y: r.top - host.top - PAD,
    w: r.width + PAD * 2,
    h: r.height + PAD * 2,
    r: Math.min(radius + 4, Math.min(r.width, r.height) / 2 + PAD),
  };
}

function emptyRect(): SpotRect {
  return { x: 0, y: 0, w: 0, h: 0, r: 12 };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRect(a: SpotRect, b: SpotRect, t: number): SpotRect {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
    r: lerp(a.r, b.r, t),
  };
}

export function HeroSpotlightDemo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [activeLabel, setActiveLabel] = useState(TARGETS[0]?.label ?? "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduce = prefersReducedMotion();
    let disposed = false;
    let raf = 0;
    let stepIndex = reduce ? 1 : 0; // install if reduced
    let stepStarted = performance.now();
    let current = emptyRect();
    let target = emptyRect();
    let hasTarget = false;
    let pointerOverride = -1;

    const readTargets = (): (SpotRect | null)[] => {
      // Coordinate space = spotlight layer (inset 0 on .hero-section)
      const hostBox = host.getBoundingClientRect();
      const scope = host.parentElement ?? document;
      return TARGETS.map((t) => {
        const el = scope.querySelector(t.selector);
        if (!el) return null;
        return measure(el, hostBox);
      });
    };

    const applyDom = (rect: SpotRect, label: string, index: number) => {
      const ring = ringRef.current;
      const glow = glowRef.current;
      const hud = hudRef.current;
      if (!ring || !glow) return;

      const style = {
        transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        borderRadius: `${rect.r}px`,
      } as const;

      Object.assign(ring.style, style);
      Object.assign(glow.style, style);

      if (hud) {
        // Keep HUD just outside the ring when possible
        const hostH = host.clientHeight;
        const hostW = host.clientWidth;
        let hx = rect.x;
        let hy = rect.y + rect.h + 8;
        if (hy + 28 > hostH) hy = Math.max(4, rect.y - 28);
        if (hx + 180 > hostW) hx = Math.max(4, hostW - 184);
        hud.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
        hud.dataset.step = String(index + 1);
      }

      setActiveLabel(label);
      setStep(index);
    };

    const pickIndex = (): number => {
      if (pointerOverride >= 0) return pointerOverride;
      return stepIndex;
    };

    const retarget = () => {
      const rects = readTargets();
      const idx = pickIndex();
      const next = rects[idx];
      if (!next) return;
      target = next;
      if (!hasTarget) {
        current = { ...next };
        hasTarget = true;
      }
    };

    const tick = (now: number) => {
      if (disposed) return;

      if (!reduce && pointerOverride < 0) {
        if (now - stepStarted >= STEP_MS) {
          stepIndex = (stepIndex + 1) % TARGETS.length;
          stepStarted = now;
          retarget();
        }
      }

      // Keep target rects in sync with layout/scroll
      if (now % 3 < 1) retarget(); // light periodic refresh via frame count alternative
      // actually better every frame for scroll - cheap 3 queries
      retarget();

      const t = reduce ? 1 : LERP;
      current = lerpRect(current, target, t);
      const idx = pickIndex();
      const label = TARGETS[idx]?.label ?? "";
      applyDom(current, label, idx);

      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduce) return;
      const hostBox = host.getBoundingClientRect();
      const px = event.clientX;
      const py = event.clientY;
      // Only steal focus when pointer is inside hero
      if (
        px < hostBox.left ||
        px > hostBox.right ||
        py < hostBox.top ||
        py > hostBox.bottom
      ) {
        if (pointerOverride >= 0) {
          pointerOverride = -1;
          stepStarted = performance.now();
        }
        return;
      }

      const rects = readTargets();
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < rects.length; i += 1) {
        const r = rects[i];
        if (!r) continue;
        const cx = hostBox.left + r.x + r.w / 2;
        const cy = hostBox.top + r.y + r.h / 2;
        const dist = Math.hypot(px - cx, py - cy);
        // Prefer near targets
        const hitPad = Math.max(r.w, r.h) * 0.65 + 40;
        if (dist < hitPad && dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      if (best >= 0) {
        pointerOverride = best;
      }
    };

    const onResize = () => {
      hasTarget = false;
      retarget();
    };

    retarget();
    setReady(true);
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`hero-spotlight${ready ? " is-ready" : ""}`}
      aria-hidden="true"
    >
      {/* No full-section scrim — it stacked a dark plane over the brand wash.
          Spotlight is ring + local glow only (product-faithful, lighter). */}
      <div ref={glowRef} className="hero-spotlight-glow" />
      <div ref={ringRef} className="hero-spotlight-ring" />

      <div ref={hudRef} className="hero-spotlight-hud">
        <span className="hero-spotlight-hud-step">
          {step + 1}/{TARGETS.length}
        </span>
        <span className="hero-spotlight-hud-label">{activeLabel}</span>
      </div>
    </div>
  );
}
