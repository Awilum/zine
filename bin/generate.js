#!/usr/bin/env node
import { generatePublication } from '../engine/generator/index.js';
const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const publication = get('--publication');
if (!publication) {
  console.error('Usage: node bin/generate.js --publication <path>');
  process.exit(2);
}
try {
  const r = generatePublication({ publication, output: get('--output') });
  console.log(
    JSON.stringify(
      {
        typstPath: r.typstPath,
        chapters: r.chapters,
        spreads: r.spreads,
        pages: r.pages,
        images: r.images,
        title: r.title,
        author: r.author,
        location: r.location,
        year: r.year,
        paper: r.paper,
        orientation: r.orientation,
        margins: r.margins,
        bleed: r.bleed,
        font: r.font,
      },
      null,
      2,
    ),
  );
} catch (e) {
  console.error(`ZINE: ${e.message}`);
  process.exit(1);
}
