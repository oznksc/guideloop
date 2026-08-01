/**
 * Development Tour Builder entry — import from `guideloop/builder`.
 *
 * Tree-shake friendly: production apps that never import this entry
 * never ship the builder UI. Prefer a development-only import gate
 * (dynamic import when `NODE_ENV === 'development'`) so production
 * builds drop the chunk entirely. The component also returns null
 * under auto mode outside development.
 */

export { TourBuilder } from './components/TourBuilder';
export type {
  TourBuilderProps,
  BuilderStep,
  BuilderMode,
  PickIntent,
} from './components/TourBuilder/types';
export {
  createEmptyStep,
  resolveBuilderEnabled,
  DEFAULT_STORAGE_KEY,
} from './components/TourBuilder/types';
export {
  exportAsJson,
  exportAsTypeScript,
  importFromJson,
  toExportSteps,
  copyToClipboard,
} from './components/TourBuilder/export';
export {
  buildSelector,
  validateSelector,
  resolvePickTarget,
} from './components/TourBuilder/selectors';
