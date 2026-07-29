/**
 * Node test runner for tour-builder pure helpers (no Vite).
 * Run: npm test
 */
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// --- DOM setup for selector helpers ---
const dom = new JSDOM(
  `<!doctype html><html><body>
    <div id="builder-canvas">
      <button id="save-btn">Save</button>
      <div class="wrap"><span data-tour-id="chip">Pro</span></div>
      <input name="email" />
      <button id="a">A</button>
      <button id="b">B</button>
    </div>
    <div data-builder-chrome><button id="chrome-btn">Chrome</button></div>
  </body></html>`,
  { url: 'http://localhost/' }
);

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.CSS = {
  escape: (s) => s.replace(/([^a-zA-Z0-9_-])/g, '\\$1'),
};

// Dynamic import after globals exist — TypeScript sources via vite-node? Use inline reimplementation checks via built files if needed.
// Prefer importing compiled logic by duplicating critical pure functions for export tests inline,
// and import selectors via relative path with tsx.

const { buildSelector, isBuilderChrome, isInsideCanvas, validateSelector } =
  await import('./selectors.ts');
const { exportAsJson, importFromJson, toExportSteps } = await import('./export.ts');

// selectors
const save = document.getElementById('save-btn');
assert.equal(buildSelector(save), '#save-btn');

const chip = document.querySelector('[data-tour-id="chip"]');
assert.equal(buildSelector(chip), '[data-tour-id="chip"]');

const input = document.querySelector('input[name="email"]');
assert.equal(buildSelector(input), 'input[name="email"]');

assert.equal(isInsideCanvas(save), true);
assert.equal(isBuilderChrome(document.getElementById('chrome-btn')), true);
assert.equal(isBuilderChrome(save), false);

assert.equal(validateSelector('#save-btn').status, 'valid');
assert.equal(validateSelector('#nope').status, 'missing');
assert.equal(validateSelector('').status, 'empty');
assert.equal(validateSelector('###').status, 'invalid');
assert.equal(validateSelector('button').status, 'ambiguous');

// export / import
const steps = [
  {
    id: '1',
    target: '#save-btn',
    title: 'Save',
    content: 'Click save',
    placement: 'bottom',
    spotlightShape: 'circle',
    spotlightPadding: 8,
    trigger: 'click',
    additionalTargets: ['#metric'],
  },
];

const json = exportAsJson(steps);
const parsed = importFromJson(json);
assert.equal(parsed.ok, true);
if (parsed.ok) {
  assert.equal(parsed.steps[0].target, '#save-btn');
  assert.equal(parsed.steps[0].spotlightShape, 'circle');
  assert.equal(parsed.steps[0].trigger, 'click');
  assert.deepEqual(parsed.steps[0].additionalTargets, ['#metric']);
}

const slim = toExportSteps(steps)[0];
assert.equal(slim.spotlightPadding, undefined);
assert.equal(slim.spotlightShape, 'circle');
assert.deepEqual(slim.additionalTargets, ['#metric']);

assert.equal(importFromJson('{').ok, false);
assert.equal(importFromJson('[]').ok, true);
assert.equal(importFromJson('{"steps":[]}').ok, true);
assert.equal(importFromJson('[{"title":"x"}]').ok, false);

console.log('✓ tour-builder lib tests passed');
