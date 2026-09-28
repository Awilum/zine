import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const cli = path.resolve('src/cli/index.js');
const run = (...args) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('zine --version works', () => {
  const r = run('--version');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^3\.0\.0\n$/);
});

test('zine --help works', () => {
  const r = run('--help');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /independent publishing/);
});

test('zine info rejects a non-project', () => {
  const r = run('info', '/tmp/definitely-not-a-zine-project');
  assert.notEqual(r.status, 0);
});
