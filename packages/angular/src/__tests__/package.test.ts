import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(__dirname, '../../dist');

describe('@guideloop/angular package artifacts', () => {
  it('ships ng-packagr dist with package metadata', () => {
    expect(fs.existsSync(path.join(dist, 'package.json'))).toBe(true);
    const pkg = JSON.parse(
      fs.readFileSync(path.join(dist, 'package.json'), 'utf8')
    ) as { name: string };
    expect(pkg.name).toBe('@guideloop/angular');
  });

  it('exports GuideLoop component symbols', () => {
    // fesm path can vary slightly by ng-packagr version
    const entries = [
      path.join(dist, 'fesm2022', 'guideloop-angular.mjs'),
      path.join(dist, 'fesm2022', 'guideloop-angular.js'),
      path.join(dist, 'esm2022', 'public-api.mjs'),
    ];
    const found = entries.find((p) => fs.existsSync(p));
    expect(found).toBeTruthy();
    const src = fs.readFileSync(found as string, 'utf8');
    expect(src).toMatch(/GuideLoopComponent/);
    expect(src).toMatch(/OnboardingChecklistComponent/);
    expect(src).toMatch(/ProgressComponent/);
  });
});
