import fs from 'node:fs';
import path from 'node:path';
import { loadYaml } from './yaml.js';
import { ValidationError } from './errors.js';
const nat = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
function yamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((x) => x.endsWith('.yaml') || x.endsWith('.yml'))
    .sort(nat)
    .map((x) => path.join(dir, x));
}
export function loadChapterDirectory(chaptersRoot) {
  if (!fs.existsSync(chaptersRoot)) return [];
  return fs
    .readdirSync(chaptersRoot, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .sort((a, b) => nat(a.name, b.name))
    .map((entry, index) => {
      const root = path.join(chaptersRoot, entry.name),
        cfg = path.join(root, 'chapter.yaml');
      if (!fs.existsSync(cfg))
        throw new ValidationError(
          `Missing chapter.yaml: ${path.relative(chaptersRoot, root)}`,
        );
      const chapter = loadYaml(cfg);
      if (!chapter.id) chapter.id = entry.name.replace(/^\d+[-_]/, '');
      if (!chapter.title)
        throw new ValidationError(`Chapter ${entry.name} is missing title`);
      chapter.number = chapter.number ?? index + 1;
      chapter.opener = chapter.opener === undefined ? false : chapter.opener;
      chapter.root = root;
      chapter.spreads = yamlFiles(root).filter(
        (x) => path.basename(x) !== 'chapter.yaml',
      );
      if (!chapter.spreads.length)
        throw new ValidationError(`Chapter ${chapter.id} is empty`);
      return chapter;
    });
}
