/**
 * Run the package-local `rollup` binary (not a hoisted @rollup/wasm-node bin).
 * Angular/ng-packagr installs @rollup/wasm-node which can overwrite
 * node_modules/.bin/rollup with Rollup 4, breaking packages that pin Rollup 2/3.
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.cwd(), 'package.json'));
const rollupBin = require.resolve('rollup/dist/bin/rollup');
const result = spawnSync(process.execPath, [rollupBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
