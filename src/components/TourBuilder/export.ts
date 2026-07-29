import type { BuilderStep } from './types';
import {
  createEmptyStep,
  isValidPlacement,
  isValidShape,
} from './types';

export function toExportSteps(steps: BuilderStep[]) {
  return steps.map(
    ({ id: _id, trigger, spotlightPadding, additionalTargets, ...rest }) => {
      const step: Record<string, unknown> = {
        target: rest.target,
        title: rest.title,
        content: rest.content,
        placement: rest.placement,
      };
      if (rest.spotlightShape && rest.spotlightShape !== 'rect') {
        step.spotlightShape = rest.spotlightShape;
      }
      if (spotlightPadding !== undefined && spotlightPadding !== 8) {
        step.spotlightPadding = spotlightPadding;
      }
      if (trigger) step.trigger = trigger;
      if (additionalTargets && additionalTargets.length > 0) {
        step.additionalTargets = additionalTargets;
      }
      return step;
    }
  );
}

export function exportAsJson(steps: BuilderStep[]): string {
  return JSON.stringify(toExportSteps(steps), null, 2);
}

export function exportAsTypeScript(steps: BuilderStep[]): string {
  return `import type { Step } from 'guideloop';

export const steps: Step[] = ${exportAsJson(steps)};
`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export type ImportResult =
  | { ok: true; steps: BuilderStep[] }
  | { ok: false; error: string };

export function importFromJson(raw: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }

  const list = Array.isArray(data)
    ? data
    : data &&
        typeof data === 'object' &&
        Array.isArray((data as { steps?: unknown }).steps)
      ? (data as { steps: unknown[] }).steps
      : null;

  if (!list) {
    return {
      ok: false,
      error: 'Expected a JSON array or { "steps": [...] }',
    };
  }

  const steps: BuilderStep[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    if (!item || typeof item !== 'object') {
      return { ok: false, error: `Step ${i + 1} is not an object` };
    }
    const rec = item as Record<string, unknown>;
    if (typeof rec.target !== 'string' || !rec.target.trim()) {
      return { ok: false, error: `Step ${i + 1} needs a string "target"` };
    }
    if (typeof rec.title !== 'string') {
      return { ok: false, error: `Step ${i + 1} needs a string "title"` };
    }
    const content =
      typeof rec.content === 'string'
        ? rec.content
        : rec.content == null
          ? ''
          : String(rec.content);

    steps.push(
      createEmptyStep({
        target: rec.target.trim(),
        title: rec.title,
        content,
        placement: isValidPlacement(rec.placement) ? rec.placement : 'bottom',
        spotlightShape: isValidShape(rec.spotlightShape)
          ? rec.spotlightShape
          : 'rect',
        spotlightPadding:
          typeof rec.spotlightPadding === 'number' ? rec.spotlightPadding : 8,
        trigger:
          typeof rec.trigger === 'string'
            ? (rec.trigger as BuilderStep['trigger'])
            : '',
        additionalTargets: Array.isArray(rec.additionalTargets)
          ? rec.additionalTargets.filter((t): t is string => typeof t === 'string')
          : [],
      })
    );
  }

  return { ok: true, steps };
}
