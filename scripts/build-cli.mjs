#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const source = path.join(root, 'src/cli/index.js');
const bundled = path.join(dist, 'zine-cli.bundle.cjs');
const esbuild = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'esbuild.cmd' : 'esbuild',
);

console.log('ZINE CLI build');

if (fs.existsSync(esbuild)) {
  const result = spawnSync(
    esbuild,
    [
      source,
      '--bundle',
      '--platform=node',
      '--format=cjs',
      '--outfile=' + bundled,
      '--minify=false',
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) process.exit(result.status || 1);
  console.log(`✓ Bundled CLI: ${bundled}`);
} else {
  console.log('esbuild is not installed; creating a source artifact instead.');
  fs.copyFileSync(source, path.join(dist, 'zine-cli-source.js'));
  console.log(
    'Install developer dependencies and rerun this command to create a standalone bundle.',
  );
}

const check = spawnSync(process.execPath, [source, '--version'], {
  encoding: 'utf8',
});
if (check.status !== 0) process.exit(check.status || 1);
console.log('✓ CLI smoke test:', check.stdout.trim());

console.log(`\nTarget artifacts should use these names:`);
const names =
  process.platform === 'win32'
    ? ['zine-windows-x64.exe']
    : process.platform === 'darwin'
      ? ['zine-macos-arm64', 'zine-macos-x64']
      : ['zine-linux-x64', 'zine-linux-arm64'];
for (const name of names) console.log(`  dist/${name}`);
console.log(
  '\nFor a fully standalone release, package the bundled CLI with Node Single Executable Applications and include the matching Typst binary beside it.',
);
