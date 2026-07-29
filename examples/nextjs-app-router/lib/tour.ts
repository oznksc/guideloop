// RSC-safe: types-only entry (no client components)
import type { Step } from 'guideloop/types';

/** Shared multi-page tour: steps 0–1 on home, step 2 on /dashboard */
export const TOUR_PERSIST_KEY = 'guideloop-example-nextjs';

export const homeSteps: Step[] = [
  {
    target: '#start-tour',
    title: 'Welcome (App Router)',
    content:
      'This Next.js App Router example uses a client tour component. Click Next to continue.',
    placement: 'bottom',
  },
  {
    target: '#go-dashboard',
    title: 'Cross-page tour',
    content:
      'Open the dashboard. With persist.autoRestore, the tour resumes on the next page.',
    placement: 'bottom',
  },
];

export const dashboardSteps: Step[] = [
  {
    target: '#dashboard-metric',
    title: 'Dashboard metric',
    content: 'You resumed mid-tour after a route change. Finish when ready.',
    placement: 'left',
  },
];
