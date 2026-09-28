import { generatePublication } from '../../../engine/generator/index.js';
export function validateCommand(root) {
  const result = generatePublication({ publication: root });
  return {
    valid: true,
    chapters: result.chapters,
    spreads: result.spreads,
    pages: result.pages,
    images: result.images,
  };
}
