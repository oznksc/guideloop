import type { Step } from '@guideloop/react';

export const TOUR_KEY = 'guideloop-example-remix';

export const allSteps: Step[] = [
  {
    target: '#remix-start',
    title: 'Remix multi-route tour',
    content: 'Start here, then open Settings. Progress is restored via sessionStorage.',
    placement: 'bottom',
  },
  {
    target: '#link-settings',
    title: 'Navigate to Settings',
    content: 'Click Settings in the nav. autoRestore reopens the tour on the next route.',
    placement: 'bottom',
  },
  {
    target: '#settings-toggle',
    title: 'Settings control',
    content: 'You resumed after a Remix client-side navigation. Finish the tour here.',
    placement: 'left',
  },
];
