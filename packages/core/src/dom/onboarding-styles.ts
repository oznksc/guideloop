/* Hallmark · pre-emit critique: P4 H5 E5 S4 R5 V4
 * component: onboarding-checklist · genre: modern-minimal · theme: inherited
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (40–41) · responsive: pass (49–51)
 */

const STYLE_ELEMENT_ID = 'guideloop-onboarding-styles';

const styles = `
.guideloop-onboarding,
.guideloop-onboarding-modal__backdrop {
  --gl-onboarding-background: #ffffff;
  --gl-onboarding-text: #1f2937;
  --gl-onboarding-accent: #2563eb;
  --gl-onboarding-accent-text: #ffffff;
  --gl-onboarding-hover: rgba(127, 127, 127, 0.09);
  --gl-onboarding-border: rgba(127, 127, 127, 0.22);
  --gl-onboarding-track: rgba(127, 127, 127, 0.2);
  --gl-onboarding-danger: #b42318;
  --gl-onboarding-backdrop: rgba(15, 23, 42, 0.58);
  --gl-onboarding-radius: 12px;
  --gl-onboarding-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  --gl-onboarding-modal-shadow: 0 24px 72px rgba(15, 23, 42, 0.24);
}

.guideloop-onboarding {
  color: var(--gl-onboarding-text);
  background: var(--gl-onboarding-background);
  border: 1px solid var(--gl-onboarding-border);
  border-radius: var(--gl-onboarding-radius);
  box-shadow: var(--gl-onboarding-shadow);
  box-sizing: border-box;
  inline-size: min(100%, 380px);
  overflow: clip;
  font-family: inherit;
}

.guideloop-onboarding *,
.guideloop-onboarding *::before,
.guideloop-onboarding *::after,
.guideloop-onboarding-modal *,
.guideloop-onboarding-modal *::before,
.guideloop-onboarding-modal *::after {
  box-sizing: border-box;
}

.guideloop-onboarding__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 20px 20px 16px;
}

.guideloop-onboarding__heading {
  min-width: 0;
}

.guideloop-onboarding__title {
  margin: 0;
  color: inherit;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.guideloop-onboarding__description {
  margin: 4px 0 0;
  color: inherit;
  font-size: 0.8125rem;
  line-height: 1.45;
  opacity: 0.68;
}

.guideloop-onboarding__progress-copy {
  margin-top: 8px;
  color: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  opacity: 0.72;
}

.guideloop-onboarding__collapse {
  display: inline-grid;
  place-items: center;
  inline-size: 32px;
  block-size: 32px;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: background-color 120ms cubic-bezier(0.2, 0, 0, 1), opacity 120ms cubic-bezier(0.2, 0, 0, 1), transform 120ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding__collapse:hover {
  background: var(--gl-onboarding-hover);
  opacity: 1;
}

.guideloop-onboarding__collapse:focus-visible,
.guideloop-onboarding__item-control:focus-visible,
.guideloop-onboarding-modal__button:focus-visible,
.guideloop-onboarding-modal__close:focus-visible {
  outline: 2px solid var(--gl-onboarding-accent);
  outline-offset: 2px;
}

.guideloop-onboarding__collapse:active {
  transform: translateY(1px);
}

.guideloop-onboarding__collapse:disabled,
.guideloop-onboarding-modal__close:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.guideloop-onboarding__collapse svg {
  transition: transform 160ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding[data-collapsed="true"] .guideloop-onboarding__collapse svg {
  transform: rotate(180deg);
}

.guideloop-onboarding__progress-track {
  block-size: 4px;
  overflow: hidden;
  background: var(--gl-onboarding-track);
}

.guideloop-onboarding__progress-value {
  inline-size: 100%;
  block-size: 100%;
  background: var(--gl-onboarding-accent);
  transform: scaleX(var(--gl-onboarding-progress, 0));
  transform-origin: left center;
  transition: transform 220ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding__items {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 8px;
  list-style: none;
  border-top: 1px solid var(--gl-onboarding-border);
}

.guideloop-onboarding__item-control {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 20px;
  gap: 12px;
  align-items: center;
  inline-size: 100%;
  min-block-size: 56px;
  padding: 8px;
  color: inherit;
  text-align: left;
  text-decoration: none;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  transition: background-color 120ms cubic-bezier(0.2, 0, 0, 1), transform 120ms cubic-bezier(0.2, 0, 0, 1), opacity 120ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding__item-control:hover {
  background: var(--gl-onboarding-hover);
}

.guideloop-onboarding__item-control:active {
  transform: translateY(1px);
}

.guideloop-onboarding__item-control[aria-disabled="true"],
.guideloop-onboarding__item-control:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.guideloop-onboarding__status {
  display: inline-grid;
  place-items: center;
  inline-size: 24px;
  block-size: 24px;
  color: inherit;
  border: 1px solid var(--gl-onboarding-border);
  border-radius: 50%;
  opacity: 0.72;
}

.guideloop-onboarding__item-control[data-state="success"] .guideloop-onboarding__status {
  color: var(--gl-onboarding-accent-text);
  background: var(--gl-onboarding-accent);
  border-color: var(--gl-onboarding-accent);
  opacity: 1;
}

.guideloop-onboarding__item-control[data-state="loading"] .guideloop-onboarding__status::after {
  content: "";
  inline-size: 10px;
  block-size: 10px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: guideloop-onboarding-spin 700ms linear infinite;
}

.guideloop-onboarding__item-control[data-state="error"] .guideloop-onboarding__status {
  color: var(--gl-onboarding-danger);
  border-color: currentColor;
  opacity: 1;
}

.guideloop-onboarding__item-copy {
  min-width: 0;
}

.guideloop-onboarding__item-title,
.guideloop-onboarding__item-description {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guideloop-onboarding__item-title {
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.35;
}

.guideloop-onboarding__item-description {
  margin-top: 4px;
  font-size: 0.75rem;
  line-height: 1.4;
  opacity: 0.72;
}

.guideloop-onboarding__item-control[data-state="success"] .guideloop-onboarding__item-title {
  opacity: 0.65;
}

.guideloop-onboarding__item-control[data-state="error"] .guideloop-onboarding__item-description {
  color: var(--gl-onboarding-danger);
  opacity: 1;
}

.guideloop-onboarding__item-icon,
.guideloop-onboarding__chevron {
  display: inline-grid;
  place-items: center;
}

.guideloop-onboarding__chevron {
  opacity: 0.42;
}

.guideloop-onboarding__empty {
  margin: 0;
  padding: 20px;
  border-top: 1px solid var(--gl-onboarding-border);
  font-size: 0.8125rem;
  line-height: 1.5;
  opacity: 0.65;
}

.guideloop-onboarding-modal__backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  color: var(--gl-onboarding-text);
  background: var(--gl-onboarding-backdrop);
  animation: guideloop-onboarding-fade-in 140ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding-modal {
  position: relative;
  inline-size: min(100%, 520px);
  max-block-size: min(720px, calc(100vh - 40px));
  overflow-y: auto;
  color: var(--gl-onboarding-text);
  background: var(--gl-onboarding-background);
  border: 1px solid var(--gl-onboarding-border);
  border-radius: var(--gl-onboarding-radius);
  box-shadow: var(--gl-onboarding-modal-shadow);
  animation: guideloop-onboarding-modal-in 180ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding-modal__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  padding: 24px 24px 0;
}

.guideloop-onboarding-modal__title {
  margin: 0;
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.guideloop-onboarding-modal__close {
  display: inline-grid;
  place-items: center;
  inline-size: 32px;
  block-size: 32px;
  margin: -4px -4px 0 0;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.62;
}

.guideloop-onboarding-modal__close:hover {
  background: var(--gl-onboarding-hover);
  opacity: 1;
}

.guideloop-onboarding-modal__body {
  padding: 16px 24px 24px;
  font-size: 0.875rem;
  line-height: 1.6;
}

.guideloop-onboarding-modal__error {
  margin: 0 24px 16px;
  color: var(--gl-onboarding-danger);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.guideloop-onboarding-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--gl-onboarding-border);
}

.guideloop-onboarding-modal__button {
  min-block-size: 36px;
  padding: 8px 16px;
  color: inherit;
  background: transparent;
  border: 1px solid var(--gl-onboarding-border);
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 650;
  white-space: nowrap;
  transition: background-color 120ms cubic-bezier(0.2, 0, 0, 1), transform 120ms cubic-bezier(0.2, 0, 0, 1), opacity 120ms cubic-bezier(0.2, 0, 0, 1);
}

.guideloop-onboarding-modal__button:hover {
  background: var(--gl-onboarding-hover);
}

.guideloop-onboarding-modal__button:active {
  transform: translateY(1px);
}

.guideloop-onboarding-modal__button--primary {
  color: var(--gl-onboarding-accent-text);
  background: var(--gl-onboarding-accent);
  border-color: var(--gl-onboarding-accent);
}

.guideloop-onboarding-modal__button--primary:hover {
  filter: brightness(0.94);
  background: var(--gl-onboarding-accent);
}

.guideloop-onboarding-modal__button:disabled {
  cursor: wait;
  opacity: 0.52;
  transform: none;
}

@keyframes guideloop-onboarding-spin {
  to { transform: rotate(360deg); }
}

@keyframes guideloop-onboarding-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes guideloop-onboarding-modal-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 414px) {
  .guideloop-onboarding__header {
    padding: 16px;
  }

  .guideloop-onboarding__items {
    padding: 8px;
  }

  .guideloop-onboarding-modal__backdrop {
    align-items: end;
    padding: 0;
  }

  .guideloop-onboarding-modal {
    inline-size: 100%;
    max-block-size: calc(100vh - 20px);
    border-radius: var(--gl-onboarding-radius) var(--gl-onboarding-radius) 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guideloop-onboarding *,
  .guideloop-onboarding-modal *,
  .guideloop-onboarding-modal__backdrop {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
`;

export function injectOnboardingStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const styleElement = document.createElement('style');
  styleElement.id = STYLE_ELEMENT_ID;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
