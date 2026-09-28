import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseYaml } from '../engine/generator/yaml.js';
import {
  validateSpread,
  validateTextPosition,
} from '../engine/generator/validation.js';
import { listLayouts } from '../engine/generator/registry.js';
import '../engine/generator/layouts/index.js';
import { loadChapterDirectory } from '../engine/generator/chapters.js';
import { loadPublication } from '../engine/generator/publication.js';
import { publicationPaths } from '../engine/generator/paths.js';
import { generatePublication } from '../engine/generator/index.js';
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kniga-'));
  for (const d of [
    'content/frontmatter',
    'content/chapters/02-b',
    'content/chapters/01-a',
    'content/backmatter',
    'content/spreads',
    'images',
  ])
    fs.mkdirSync(path.join(root, d), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'content/book.yaml'),
    `id: test\nmetadata:\n  title: Test\n  author: Author\n  year: 2026\nformat:\n  paper: a4\n  orientation: portrait\n  margins:\n    top: 18\n    right: 18\n    bottom: 18\n    left: 18\n  bleed: 0\n`,
  );
  fs.writeFileSync(
    path.join(root, 'content/chapters/01-a/chapter.yaml'),
    'id: a\ntitle: A\nsubtitle: First\nopener: true\n',
  );
  fs.writeFileSync(
    path.join(root, 'content/chapters/02-b/chapter.yaml'),
    'id: b\ntitle: B\nopener: false\n',
  );
  for (const d of ['01-a', '02-b'])
    fs.writeFileSync(
      path.join(root, `content/chapters/${d}/001.yaml`),
      'left:\n  type: text\n  text: Hello\nright:\n  type: blank\n',
    );
  fs.writeFileSync(
    path.join(root, 'content/frontmatter/001.yaml'),
    'left:\n  type: title\n  title: Test\nright:\n  type: blank\n',
  );
  fs.writeFileSync(
    path.join(root, 'content/backmatter/001.yaml'),
    'left:\n  type: text\n  text: End\nright:\n  type: blank\n',
  );
  return root;
}
test('all layouts are registered', () =>
  assert.deepEqual(listLayouts(), [
    'blank',
    'title',
    'photo',
    'photos-2',
    'photos-3',
    'photos-4',
    'text',
    'photo-text',
    'text-photo',
    'quote',
    'chapter',
    'contents',
  ]));
test('legacy image layout rejects page alignment', () =>
  assert.throws(() =>
    validateSpread({
      left: { type: 'photo', image: 'x.png', vertical: 'top' },
      right: { type: 'blank' },
    }),
  ));
test('text layout accepts alignment', () =>
  assert.doesNotThrow(() =>
    validateSpread({
      left: { type: 'text', text: 'x', vertical: 'top', horizontal: 'left' },
      right: { type: 'blank' },
    }),
  ));
test('mixed layout accepts textPosition', () =>
  assert.doesNotThrow(() =>
    validateSpread({
      left: {
        type: 'photo-text',
        image: 'x.png',
        text: 'x',
        textPosition: 'right',
      },
      right: { type: 'blank' },
    }),
  ));
test('invalid textPosition is rejected', () =>
  assert.throws(() => validateTextPosition('diagonal')));
test('block scalar YAML works', () =>
  assert.equal(
    parseYaml('text: |\n  hello\n  world\n').text,
    'hello\nworld\n',
  ));
test('chapters natural sort and metadata', () => {
  const r = loadChapterDirectory(path.join(fixture(), 'content/chapters'));
  assert.deepEqual(
    r.map((x) => x.id),
    ['a', 'b'],
  );
  assert.equal(r[0].number, 1);
});
test('publication includes frontmatter chapters backmatter', () => {
  const root = fixture(),
    p = loadPublication(root, publicationPaths(root));
  assert.equal(
    p.sections.map((x) => x.type).join(','),
    'frontmatter,chapter,chapter,backmatter',
  );
  assert.equal(p.chapters.length, 2);
  assert.equal(p.sections[1].spreads.length, 2);
});
test('legacy publication has zero chapters', () => {
  const root = fixture();
  fs.rmSync(path.join(root, 'content/chapters'), { recursive: true });
  const p = loadPublication(root, publicationPaths(root));
  assert.equal(p.chapters.length, 0);
});
test('generation returns chapter/spread/page statistics', () => {
  const root = fixture();
  const r = generatePublication({ publication: root });
  assert.equal(r.chapters, 2);
  assert.equal(r.spreads, 5);
  assert.equal(r.pages, 10);
  assert.match(fs.readFileSync(r.typstPath, 'utf8'), /chapter:a/);
});
