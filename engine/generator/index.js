import fs from 'node:fs';
import path from 'node:path';
import { resolvePublicationRoot, publicationPaths } from './paths.js';
import { GenerationError } from './errors.js';
import {
  loadPublication,
  renderPublication,
  collectStats,
} from './publication.js';
import { assembleTypst } from './typst.js';
import './layouts/index.js';
export function generatePublication(options = {}) {
  const root = resolvePublicationRoot(options.publication);
  const paths = publicationPaths(root);
  fs.mkdirSync(paths.build, { recursive: true });
  fs.mkdirSync(paths.output, { recursive: true });
  try {
    const publication = loadPublication(root, paths);
    const body = renderPublication(publication, paths, paths.build);
    const typst = assembleTypst(publication.book, body, publication);
    const out = options.output || path.join(paths.build, 'zine.typ');
    fs.writeFileSync(out, typst);
    const stats = collectStats(publication);
    return {
      typstPath: out,
      spreads: stats.spreads,
      pages: stats.pages,
      images: stats.images,
      chapters: stats.chapters,
      title: publication.book.metadata.title,
      author: publication.book.metadata.author,
      location: publication.book.metadata.location || '',
      year: publication.book.metadata.year,
      paper: publication.book.format.paper,
      orientation: publication.book.format.orientation,
      margins: publication.book.format.margins,
      bleed: publication.book.format.bleed || 0,
      font: publication.book.typography?.font || 'Avenir Next',
      publication,
    };
  } catch (e) {
    if (e instanceof GenerationError) throw e;
    throw new GenerationError(e.message, e);
  }
}
