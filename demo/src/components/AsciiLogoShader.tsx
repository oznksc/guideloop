"use client";

import { useEffect, useRef } from "react";
import { withBasePath } from "../utils/asset";

/**
 * Rasterizes the GuideLoop logo into a transparent ASCII field.
 * Precomputes density cells, then animates mouse-reactive glow / offset.
 */

const RAMP = " .·:;+=xX$&#@";
const BRAND: [number, number, number] = [3, 119, 217];

interface AsciiCell {
  x: number;
  y: number;
  density: number;
  baseIdx: number;
}

function readAccentRgb(): [number, number, number] {
  if (typeof window === "undefined") return BRAND;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  const hex = raw.startsWith("#") ? raw.slice(1) : "";
  if (hex.length !== 3 && hex.length !== 6) return BRAND;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return BRAND;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Logo failed to load: ${url}`));
    img.src = url;
  });
}

function rasterizeLogo(
  img: HTMLImageElement,
  maxW: number,
): HTMLCanvasElement {
  const iw = img.naturalWidth || img.width || 1825;
  const ih = img.naturalHeight || img.height || 481;
  const aspect = iw / Math.max(ih, 1);
  const w = Math.min(maxW, Math.max(iw, 1024));
  const h = Math.max(1, Math.round(w / aspect));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

function cellDensity(
  data: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const left = Math.max(0, Math.floor(x0));
  const top = Math.max(0, Math.floor(y0));
  const right = Math.min(srcW, Math.ceil(x1));
  const bottom = Math.min(srcH, Math.ceil(y1));
  if (right <= left || bottom <= top) return 0;

  let sum = 0;
  let count = 0;
  const stepX = Math.max(1, Math.floor((right - left) / 6));
  const stepY = Math.max(1, Math.floor((bottom - top) / 6));

  for (let y = top; y < bottom; y += stepY) {
    for (let x = left; x < right; x += stepX) {
      const i = (y * srcW + x) * 4;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = (data[i + 3] ?? 0) / 255;
      if (a < 0.04) {
        count += 1;
        continue;
      }
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      sum += a * Math.max(lum, 0.35);
      count += 1;
    }
  }
  if (count === 0) return 0;
  return Math.min(1, sum / count);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AsciiLogoShader({
  logoSrc = "/guideloop-logo.svg",
  className = "",
}: {
  logoSrc?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let raf = 0;
    let srcCanvas: HTMLCanvasElement | null = null;
    let srcData: ImageData | null = null;
    let cells: AsciiCell[] = [];
    let cellW = 8;
    let cellH = 12;
    let resizeObs: ResizeObserver | null = null;
    let themeObs: MutationObserver | null = null;
    let layoutKey = "";

    // Smoothed pointer in canvas CSS pixels (-1 = inactive)
    let targetMx = -1;
    let targetMy = -1;
    let smoothMx = -1;
    let smoothMy = -1;
    let pointerActive = false;
    let needsFrame = true;
    const reduceMotion = prefersReducedMotion();

    const rebuildCells = () => {
      if (!srcCanvas || !srcData) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, canvas.clientWidth || canvas.offsetWidth || 800);
      const cssH = Math.max(1, canvas.clientHeight || canvas.offsetHeight || 280);
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      const key = `${w}x${h}@${dpr}`;
      if (key === layoutKey && cells.length > 0) return;
      layoutKey = key;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      cellW = Math.max(5, Math.round(6.5 * dpr));
      cellH = Math.max(8, Math.round(11 * dpr));
      const cols = Math.ceil(w / cellW);
      const rows = Math.ceil(h / cellH);

      const srcW = srcCanvas.width;
      const srcH = srcCanvas.height;
      const data = srcData.data;
      const logoAspect = srcW / Math.max(srcH, 1);
      const mapW = w * 0.98;
      const mapH = mapW / logoAspect;
      const offX = (w - mapW) / 2;
      const offY = Math.min(h * 0.08, Math.max(0, (h - mapH) * 0.15));

      const next: AsciiCell[] = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cx = col * cellW + cellW * 0.5;
          const cy = row * cellH + cellH * 0.5;
          const u = (cx - offX) / mapW;
          const v = (cy - offY) / mapH;
          if (u < -0.02 || u > 1.02 || v < -0.02 || v > 1.02) continue;

          const halfU = (cellW * 0.5) / mapW;
          const halfV = (cellH * 0.5) / mapH;
          const d = cellDensity(
            data,
            srcW,
            srcH,
            (u - halfU) * srcW,
            (v - halfV) * srcH,
            (u + halfU) * srcW,
            (v + halfV) * srcH,
          );
          if (d < 0.05) continue;

          const t = Math.pow(Math.min(1, d * 1.15), 0.8);
          const baseIdx = Math.min(
            RAMP.length - 1,
            Math.floor(t * (RAMP.length - 1)),
          );
          if ((RAMP[baseIdx] ?? " ") === " ") continue;

          next.push({ x: cx, y: cy, density: d, baseIdx });
        }
      }
      cells = next;
      needsFrame = true;
    };

    const paint = (time = 0) => {
      if (disposed || !srcData) return;
      rebuildCells();

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const [cr, cg, cb] = readAccentRgb();
      // Sky-tinted highlight near cursor
      const hr = Math.min(255, cr + 70);
      const hg = Math.min(255, cg + 90);
      const hb = Math.min(255, cb + 40);

      const fontPx = Math.max(8, Math.floor(cellH * 0.92));
      ctx.font = `600 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Mouse in device pixels
      const hasPointer = smoothMx >= 0 && smoothMy >= 0;
      const mx = hasPointer ? smoothMx * dpr : -1e9;
      const my = hasPointer ? smoothMy * dpr : -1e9;
      // Influence radius scales with canvas size
      const radius = Math.max(90, Math.min(w, h) * 0.42) * dpr;
      const radiusSq = radius * radius;

      // Idle shimmer when pointer not interacting
      const idle = !hasPointer || !pointerActive;

      for (let i = 0; i < cells.length; i += 1) {
        const cell = cells[i];
        if (!cell) continue;

        let influence = 0;
        let nx = 0;
        let ny = 0;

        if (hasPointer && !reduceMotion) {
          const dx = cell.x - mx;
          const dy = cell.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            // Soft falloff — bright core, gentle outer ring
            const t = 1 - dist / radius;
            influence = t * t * (3 - 2 * t); // smoothstep
            if (dist > 0.001) {
              nx = dx / dist;
              ny = dy / dist;
            }
          }
        } else if (idle && !reduceMotion) {
          // Subtle breathing so the field never feels fully dead
          const wave =
            0.5 +
            0.5 *
              Math.sin(time * 0.0012 + cell.x * 0.02 + cell.y * 0.015);
          influence = wave * 0.08;
        }

        // Glyph density boost near cursor
        const idx = Math.min(
          RAMP.length - 1,
          cell.baseIdx + Math.floor(influence * 4),
        );
        const ch = RAMP[idx] ?? "@";

        // Magnetic push away from cursor + slight orbit
        const push = influence * cellH * 0.55;
        const drawX = cell.x + nx * push;
        const drawY = cell.y + ny * push;

        const baseAlpha = 0.22 + Math.pow(cell.density, 0.8) * 0.72;
        const alpha = Math.min(1, baseAlpha * (1 + influence * 1.15));

        // Mix brand → sky highlight under the cursor
        const r = Math.round(cr + (hr - cr) * influence);
        const g = Math.round(cg + (hg - cg) * influence);
        const b = Math.round(cb + (hb - cb) * influence);

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.fillText(ch, drawX, drawY);
      }

      needsFrame = false;
    };

    const tick = (time: number) => {
      if (disposed) return;

      if (!reduceMotion) {
        if (targetMx >= 0) {
          if (smoothMx < 0) {
            smoothMx = targetMx;
            smoothMy = targetMy;
          } else {
            smoothMx += (targetMx - smoothMx) * 0.16;
            smoothMy += (targetMy - smoothMy) * 0.16;
          }
        }
        // Idle shimmer + pointer lerp always need frames
        needsFrame = true;
      }

      if (needsFrame) paint(time);
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // Expand hit area a bit above the submerged canvas
      const pad = 48;
      if (
        x >= -pad &&
        y >= -pad &&
        x <= rect.width + pad &&
        y <= rect.height + pad
      ) {
        targetMx = x;
        targetMy = y;
        pointerActive = true;
      } else if (pointerActive) {
        targetMx = -1;
        targetMy = -1;
        pointerActive = false;
        smoothMx = -1;
        smoothMy = -1;
      }
    };

    const onPointerLeave = () => {
      targetMx = -1;
      targetMy = -1;
      pointerActive = false;
      smoothMx = -1;
      smoothMy = -1;
      needsFrame = true;
    };

    const scheduleRebuild = () => {
      layoutKey = "";
      needsFrame = true;
    };

    const boot = async () => {
      try {
        const url = withBasePath(logoSrc);
        const img = await loadImage(url);
        if (disposed) return;

        srcCanvas = rasterizeLogo(img, 1600);
        const sctx = srcCanvas.getContext("2d", { willReadFrequently: true });
        if (!sctx) return;
        srcData = sctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

        rebuildCells();
        paint(0);

        resizeObs = new ResizeObserver(scheduleRebuild);
        resizeObs.observe(canvas);

        themeObs = new MutationObserver(scheduleRebuild);
        themeObs.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme", "style", "class"],
        });

        // Canvas is pointer-events: none — track on window
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("blur", onPointerLeave);

        raf = requestAnimationFrame(tick);
      } catch (err) {
        console.error("[AsciiLogoShader]", err);
      }
    };

    void boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObs?.disconnect();
      themeObs?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [logoSrc]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
