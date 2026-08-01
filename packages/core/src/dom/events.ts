export const GUIDE_RESTART_EVENT = 'guideRestart';
export const RESTART_DELAY = 100;

export type GuideRestartEvent = CustomEvent<{ nextStep: number }>;

export const createRestartEvent = (nextStep: number) =>
  new CustomEvent(GUIDE_RESTART_EVENT, {
    detail: { nextStep }
  });
