export type PersistType = 'localStorage' | 'sessionStorage';

export interface TourState {
  currentStepIndex: number;
  isActive: boolean;
}

export interface PersistConfig {
  key: string;
  type?: PersistType;
  autoRestore?: boolean;
}
