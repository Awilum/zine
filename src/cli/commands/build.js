import fs from 'node:fs';
import path from 'node:path';
import { generatePublication } from '../../../engine/generator/index.js';
import { runTypst } from '../../project/index.js';
import { header, success } from '../ui/terminal.js';

export function buildCommand(root, flags = {}) {
  const project = path.resolve(root);
  if (flags.clean)
    fs.rmSync(path.join(project, '.build'), { recursive: true, force: true });
  const result = generatePublication({ publication: project });
  const outputDir = path.resolve(
    project,
    String(flags.output || path.join(project, 'output')),
  );
  fs.mkdirSync(outputDir, { recursive: true });
  const filename = `${result.publication.book.id || 'publication'}.pdf`;
  const output = path.join(outputDir, filename);
  if (!flags.quiet) header('Build', `${result.title} · ${result.pages} pages`);
  runTypst(project, result.typstPath, output, { quiet: flags.quiet });
  if (!flags.quiet) success(`PDF created: ${output}`);
  return { ...result, output };
}
