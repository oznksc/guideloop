/**
 * Ensure dist/package.json is ready for `npm publish ./packages/angular/dist`.
 * ng-packagr already strips scripts/devDependencies; we only enforce access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '../dist/package.json');

if (!fs.existsSync(pkgPath)) {
  console.error('dist/package.json missing — run ng-packagr first');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.publishConfig = { access: 'public' };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('fixed dist/package.json publishConfig');
