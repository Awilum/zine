import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { generatePublication } from '../../engine/generator/index.js';
import { loadYaml, parseYaml } from '../../engine/generator/yaml.js';
import { publicationPaths } from '../../engine/generator/paths.js';

export const PROJECT_MARKERS = ['zine.yml', 'content/book.yaml'];

export function findProjectRoot(start = process.cwd()) {
  let current = path.resolve(start);
  while (true) {
    if (PROJECT_MARKERS.some((file) => fs.existsSync(path.join(current, file))))
      return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function isProject(root) {
  return PROJECT_MARKERS.some((file) =>
    fs.existsSync(path.join(path.resolve(root), file)),
  );
}

export function projectConfigPath(root) {
  const zine = path.join(root, 'zine.yml');
  return fs.existsSync(zine) ? zine : path.join(root, 'content', 'book.yaml');
}

export function loadProject(root) {
  const projectRoot = path.resolve(root);
  const configPath = projectConfigPath(projectRoot);
  if (!fs.existsSync(configPath))
    throw new Error(`No ZINE project configuration found in ${projectRoot}`);
  const config = loadYaml(configPath);
  const paths = publicationPaths(projectRoot);
  return { root: projectRoot, configPath, config, paths };
}

export function projectStats(root) {
  const result = generatePublication({ publication: root });
  return {
    title: result.title,
    author: result.author,
    location: result.location,
    year: result.year,
    type: result.publication.book.type ?? 'custom',
    chapters: result.chapters,
    spreads: result.spreads,
    pages: result.pages,
    images: result.images,
    paper: result.paper,
    orientation: result.orientation,
    margins: result.margins,
    bleed: result.bleed,
    font: result.font,
  };
}

export function runTypst(root, typstPath, outputPath, { quiet = false } = {}) {
  const result = spawnSync(
    'typst',
    ['compile', '--root', root, typstPath, outputPath],
    {
      stdio: quiet ? 'ignore' : 'inherit',
      shell: false,
    },
  );
  if (result.error)
    throw new Error(`Typst is not available: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(
      `Typst compilation failed with exit code ${result.status ?? 1}`,
    );
  return outputPath;
}

export function safeProjectPath(root, relative) {
  const project = path.resolve(root);
  const target = path.resolve(project, relative);
  if (target !== project && !target.startsWith(project + path.sep))
    throw new Error(`Path escapes project directory: ${relative}`);
  return target;
}

export function writeYamlString(value) {
  const s = String(value ?? '');
  return /^[A-Za-z0-9._/-]+$/.test(s) ? s : JSON.stringify(s);
}
