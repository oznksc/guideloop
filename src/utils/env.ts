/** True when DOM globals exist (browser / RN-Web). False during SSR / RSC. */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
