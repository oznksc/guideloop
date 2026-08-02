/**
 * ng-packagr copies package.json into dist/. Strip publishConfig.directory
 * so the published package is the dist root (not dist/dist).
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
if (pkg.publishConfig && 'directory' in pkg.publishConfig) {
  delete pkg.publishConfig.directory;
  if (Object.keys(pkg.publishConfig).length === 0) {
    delete pkg.publishConfig;
  } else {
    // Keep access: public for re-publish safety
    pkg.publishConfig.access = pkg.publishConfig.access || 'public';
  }
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('fixed dist/package.json publishConfig');
