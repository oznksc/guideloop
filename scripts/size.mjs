#!/usr/bin/env node
/**
 * Report published JS sizes (raw + gzip).
 * Run after `npm run build`.
 *
 * Measures:
 *  - Full ESM graph under dist/esm (library code only; @popperjs/core external)
 *  - Entry chunk dist/esm/index.js
 *  - GuideLoop entry module (approximate core path)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walkJs(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkJs(p, acc);
    else if (name.endsWith('.js') && !name.endsWith('.map.js')) acc.push(p);
  }
  return acc;
}

function sizeOf(buf) {
  return { raw: buf.length, gzip: gzipSync(buf).length };
}

function fmt(n) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} kB`;
}

function report(label, buf) {
  const s = sizeOf(buf);
  console.log(
    `${label.padEnd(42)} raw ${fmt(s.raw).padStart(10)}  gzip ${fmt(s.gzip).padStart(10)}`
  );
  return s;
}

const esmFiles = walkJs(join(root, 'dist/esm'));
if (esmFiles.length === 0) {
  console.error('No dist/esm JS found. Run `npm run build` first.');
  process.exit(1);
}

const all = Buffer.concat(esmFiles.map((f) => readFileSync(f)));
console.log(`GuideLoop size report (${esmFiles.length} ESM modules, deps external)\n`);

const full = report('All published ESM modules', all);

const entry = join(root, 'dist/esm/index.js');
if (existsSync(entry)) report('Entry barrel (index.js only)', readFileSync(entry));

const guideLoop = join(root, 'dist/esm/components/GuideLoop/index.js');
if (existsSync(guideLoop)) {
  // Walk imports naively: sum GuideLoop + its static local deps is hard;
  // report the component chunk itself as a lower bound.
  report('GuideLoop component chunk', readFileSync(guideLoop));
}

const onboarding = join(root, 'dist/esm/components/OnboardingChecklist/index.js');
if (existsSync(onboarding)) {
  report('OnboardingChecklist chunk', readFileSync(onboarding));
}

const debugHud = join(root, 'dist/esm/components/DebugHUD/index.js');
if (existsSync(debugHud)) {
  report('DebugHUD chunk', readFileSync(debugHud));
}

console.log('\nNotes:');
console.log('- @popperjs/core is external (not included); ~7–8 kB gzip when loaded.');
console.log('- Consumer bundlers tree-shake unused ESM modules (sideEffects: false).');
console.log(`- Full library graph gzip: ${fmt(full.gzip)}`);

// Soft budget for the full graph without peer deps / popper
const BUDGET_GZIP = 20 * 1024;
if (full.gzip > BUDGET_GZIP) {
  console.warn(
    `\nWarning: full ESM gzip ${fmt(full.gzip)} exceeds soft budget ${fmt(BUDGET_GZIP)}.`
  );
  process.exitCode = 0; // informational for now
} else {
  console.log(`\nSoft budget OK (≤ ${fmt(BUDGET_GZIP)} gzip, deps external).`);
}
