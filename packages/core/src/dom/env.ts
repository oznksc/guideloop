/** True when DOM globals exist (browser / RN-Web). False during SSR / RSC. */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * True only for an explicit development runtime.
 *
 * Used by Tour Builder and Debug HUD auto modes so production builds
 * (and Jest `NODE_ENV=test`) never surface dev-only UI.
 *
 * Bundlers typically inline `process.env.NODE_ENV` at build time, so this
 * collapses to a constant and dead-code eliminates correctly.
 */
export function isDevelopmentEnv(): boolean {
  try {
    return (
      typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
    );
  } catch {
    return false;
  }
}
