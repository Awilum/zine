import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { generatePublication } from '../../../engine/generator/index.js';
import { findProjectRoot } from '../../project/index.js';

export function doctorCommand(root) {
  const checks = [];
  const add = (name, ok, details = '') =>
    checks.push({ name, ok: Boolean(ok), details });
  const project = path.resolve(root);
  add('Project directory', fs.existsSync(project), project);
  add(
    'Configuration',
    fs.existsSync(path.join(project, 'zine.yml')) ||
      fs.existsSync(path.join(project, 'content', 'book.yaml')),
  );
  let result = null;
  try {
    result = generatePublication({ publication: project });
    add('Publication schema', true);
  } catch (e) {
    add('Publication schema', false, e.message);
  }
  if (result) {
    add('Chapters', true, `${result.chapters} chapters`);
    add('Layouts', true, `${result.publication.pages.length} pages`);
    add('Images', true, `${result.images} referenced images`);
    add('Theme / template', true);
  }
  const typst = spawnSync('typst', ['--version'], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  add(
    'Typst',
    typst.status === 0,
    typst.status === 0 ? typst.stdout.trim() : 'Typst executable not found',
  );
  const output = path.join(project, 'output');
  add(
    'Output directory',
    fs.existsSync(output) ||
      fs.mkdirSync(output, { recursive: true }) === undefined,
    output,
  );
  return {
    healthy: checks.every((x) => x.ok),
    checks,
    stats: result
      ? {
          title: result.title,
          chapters: result.chapters,
          spreads: result.spreads,
          pages: result.pages,
          images: result.images,
        }
      : null,
  };
}

export function doctorRoot(root) {
  return findProjectRoot(root) || root;
}
