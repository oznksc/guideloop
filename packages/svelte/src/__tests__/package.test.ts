import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(__dirname, '../../dist');

describe('@guideloop/svelte package artifacts', () => {
  it('ships ESM, CJS, and type definitions after build', () => {
    expect(fs.existsSync(path.join(dist, 'index.js'))).toBe(true);
    expect(fs.existsSync(path.join(dist, 'index.cjs'))).toBe(true);
    expect(fs.existsSync(path.join(dist, 'index.d.ts'))).toBe(true);

    const dts = fs.readFileSync(path.join(dist, 'index.d.ts'), 'utf8');
    expect(dts).toContain('export declare class GuideLoop');
    expect(dts).toContain('export declare class OnboardingChecklist');
    expect(dts).toContain('export declare class Progress');
  });

  it('ESM bundle re-exports Svelte components', () => {
    const esm = fs.readFileSync(path.join(dist, 'index.js'), 'utf8');
    expect(esm).toMatch(/GuideLoop/);
    expect(esm).toMatch(/OnboardingChecklist/);
    expect(esm).toMatch(/Progress/);
  });
});
