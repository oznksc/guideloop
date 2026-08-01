"use client";

import { useEffect, useRef } from "react";

/**
 * Rasterizes the GuideLoop logo into a transparent ASCII field.
 * Uses Canvas2D sampling (reliable with SVG); cell density → glyph ramp.
 */

const RAMP = " .·:;+=xX$&#@";
const BRAND: [number, number, number] = [3, 119, 217];

function resolveLogoUrl(src: string): string {
  if (typeof window === "undefined") return src;
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  // Honor Next basePath if present (e.g. /guideloop)
  const base = document.querySelector("base")?.getAttribute("href")?.replace(/\/$/, "") ?? "";
  const prefix =
    base ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH) ||
    "";
  if (src.startsWith("/")) return `${prefix}${src}`;
  return src;
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
    // Same-origin /public asset — do NOT set crossOrigin (breaks SVG without CORS headers)
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Logo failed to load: ${url}`));
    img.src = url;
  });
}

/** Draw logo contained in bitmap with transparent padding. */
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
  // Stride sample for speed
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
      // Coverage: alpha + luminance (white letters / blue body both count)
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      sum += a * Math.max(lum, 0.35);
      count += 1;
    }
  }
  if (count === 0) return 0;
  return Math.min(1, sum / count);
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
    let resizeObs: ResizeObserver | null = null;
    let themeObs: MutationObserver | null = null;

    const paint = () => {
      if (disposed || !srcCanvas || !srcData) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, canvas.clientWidth || canvas.offsetWidth || 800);
      const cssH = Math.max(1, canvas.clientHeight || canvas.offsetHeight || 280);
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Cell size in device pixels — mono block feel
      const cellW = Math.max(5, Math.round(6.5 * dpr));
      const cellH = Math.max(8, Math.round(11 * dpr));
      const cols = Math.ceil(w / cellW);
      const rows = Math.ceil(h / cellH);

      const srcW = srcCanvas.width;
      const srcH = srcCanvas.height;
      const data = srcData.data;

      // Always fit FULL logo width into the canvas (no horizontal crop).
      // Height may extend past the canvas; CSS translateY submerges the bottom half.
      const logoAspect = srcW / Math.max(srcH, 1);
      const mapW = w * 0.98;
      const mapH = mapW / logoAspect;
      const offX = (w - mapW) / 2;
      // Bias upward so the top of the wordmark stays in the visible band
      const offY = Math.min(h * 0.08, Math.max(0, (h - mapH) * 0.15));

      const [cr, cg, cb] = readAccentRgb();
      const fontPx = Math.max(8, Math.floor(cellH * 0.92));
      ctx.font = `600 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cx = col * cellW + cellW * 0.5;
          const cy = row * cellH + cellH * 0.5;

          // Canvas px → logo source px
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
          const idx = Math.min(
            RAMP.length - 1,
            Math.floor(t * (RAMP.length - 1)),
          );
          const ch = RAMP[idx] ?? "@";
          if (ch === " ") continue;

          // Transparent feel: alpha from density
          const alpha = 0.22 + t * 0.72;
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
          ctx.fillText(ch, cx, cy);
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };

    const boot = async () => {
      try {
        const url = resolveLogoUrl(logoSrc);
        const img = await loadImage(url);
        if (disposed) return;

        srcCanvas = rasterizeLogo(img, 1600);
        const sctx = srcCanvas.getContext("2d", { willReadFrequently: true });
        if (!sctx) return;
        srcData = sctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

        // Sanity: if logo came out fully transparent, draw a debug tint once
        let opaque = 0;
        for (let i = 3; i < srcData.data.length; i += 32) {
          if ((srcData.data[i] ?? 0) > 16) opaque += 1;
        }
        if (opaque < 8) {
          console.warn(
            "[AsciiLogoShader] logo raster has almost no opacity",
            url,
            srcCanvas.width,
            srcCanvas.height,
          );
        }

        paint();
        // Second pass after layout settles (absolute canvas can report 0 on first frame)
        requestAnimationFrame(paint);

        resizeObs = new ResizeObserver(schedule);
        resizeObs.observe(canvas);

        themeObs = new MutationObserver(schedule);
        themeObs.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme", "style", "class"],
        });
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
