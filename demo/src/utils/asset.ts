/**
 * Prefix public asset paths with Next.js basePath (GitHub Pages: /guideloop).
 * NEXT_PUBLIC_BASE_PATH is inlined at build time for client bundles.
 */
export function withBasePath(path: string): string {
  if (!path || path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  if (!base) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Avoid double-prefix if caller already included basePath
  if (normalized === base || normalized.startsWith(`${base}/`)) {
    return normalized;
  }
  return `${base}${normalized}`;
}
