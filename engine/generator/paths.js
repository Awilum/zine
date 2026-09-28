import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ENGINE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
export const TEMPLATE_PATH = path.join(
  ENGINE_ROOT,
  'engine',
  'templates',
  'zine.typ',
);
export function resolvePublicationRoot(value) {
  return path.resolve(value);
}
export function publicationPaths(root) {
  return {
    root,
    content: path.join(root, 'content'),
    book: path.join(root, 'content', 'book.yaml'),
    spreads: path.join(root, 'content', 'spreads'),
    frontmatter: path.join(root, 'content', 'frontmatter'),
    chapters: path.join(root, 'content', 'chapters'),
    backmatter: path.join(root, 'content', 'backmatter'),
    images: path.join(root, 'images'),
    build: path.join(root, '.build'),
    output: path.join(root, 'output'),
  };
}
