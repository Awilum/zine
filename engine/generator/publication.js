import fs from 'node:fs';
import path from 'node:path';
import { loadYaml } from './yaml.js';
import { loadChapterDirectory } from './chapters.js';
import { validateBook, validateSpread } from './validation.js';
import { getLayout } from './registry.js';
import { resolveImage, typstImagePath } from './images.js';
import { createPages } from './pages.js';
const nat = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((x) => x.endsWith('.yaml') || x.endsWith('.yml'))
    .sort(nat)
    .map((x) => path.join(dir, x));
}
function readSpreads(dir) {
  return files(dir).map((file, i) => {
    const data = loadYaml(file);
    validateSpread(data);
    return {
      id: path.basename(file, path.extname(file)),
      name: path.basename(file, path.extname(file)),
      file,
      data,
      index: i + 1,
    };
  });
}
export function loadPublication(root, paths) {
  const modernBook = path.join(root, 'zine.yml');
  const book = loadYaml(fs.existsSync(modernBook) ? modernBook : paths.book);
  validateBook(book);
  const hasChapters =
    fs.existsSync(paths.chapters) &&
    fs
      .readdirSync(paths.chapters)
      .some((x) => fs.statSync(path.join(paths.chapters, x)).isDirectory());
  const chapters = hasChapters ? loadChapterDirectory(paths.chapters) : [];
  const front = readSpreads(paths.frontmatter);
  const back = readSpreads(paths.backmatter);
  const legacy = readSpreads(paths.spreads);
  const sections = [];
  if (front.length)
    sections.push({
      id: 'frontmatter',
      type: 'frontmatter',
      chapter: null,
      spreads: front,
    });
  for (const chapter of chapters) {
    const spreads = chapter.spreads.map((file, i) => {
      const data = loadYaml(file);
      validateSpread(data);
      return {
        id: path.basename(file, path.extname(file)),
        name: path.basename(file, path.extname(file)),
        file,
        data,
        index: i + 1,
      };
    });
    if (chapter.opener) {
      spreads.unshift({
        id: `${chapter.id}-opener`,
        name: `${chapter.id}-opener`,
        generated: true,
        data: { left: { type: 'chapter' }, right: { type: 'blank' } },
        index: 0,
      });
    }
    sections.push({ id: chapter.id, type: 'chapter', chapter, spreads });
  }
  if (!chapters.length && legacy.length)
    sections.push({
      id: 'legacy',
      type: 'legacy',
      chapter: null,
      spreads: legacy,
    });
  if (back.length)
    sections.push({
      id: 'backmatter',
      type: 'backmatter',
      chapter: null,
      spreads: back,
    });
  const ids = new Set();
  for (const c of chapters) {
    if (ids.has(c.id))
      throw new ValidationError(`Duplicate chapter id: ${c.id}`);
    ids.add(c.id);
  }
  const publication = { book, chapters, sections };
  publication.pages = createPages(publication);
  return publication;
}
function collectImages(data) {
  const out = [];
  for (const side of ['left', 'right']) {
    const d = data[side];
    if (!d) continue;
    if (d.image) out.push(d.image);
    if (Array.isArray(d.images)) out.push(...d.images);
  }
  return out;
}
function renderSide(sideData, ctx) {
  const d = sideData;
  let imagePath = null,
    imagePaths = [];
  if (d.image) {
    imagePath = typstImagePath(
      ctx.buildDir,
      resolveImage(ctx.imagesRoot, d.image),
    );
  }
  if (Array.isArray(d.images))
    imagePaths = d.images.map((x) =>
      typstImagePath(ctx.buildDir, resolveImage(ctx.imagesRoot, x)),
    );
  return getLayout(d.type).render(d, {
    ...ctx,
    imagePath,
    imagePaths,
    vertical: d.vertical,
    horizontal: d.horizontal,
    textPosition: d.textPosition,
  });
}
export function renderPublication(publication, paths, buildDir) {
  const body = [];
  for (const section of publication.sections) {
    for (const spread of section.spreads) {
      for (const side of ['left', 'right']) {
        const pageData = spread.data[side];
        const pageNumber =
          publication.pages.find(
            (p) => p.spreadId === spread.id && p.side === side,
          )?.pageNumber ?? 0;
        const page = {
          pageNumber,
          chapter: section.chapter,
          chapterNumber: section.chapter?.number ?? null,
          chapterTitle: section.chapter?.title ?? null,
          spread,
          side,
        };
        if (section.chapter && pageData.type === 'chapter') {
          body.push(
            `#heading(level: 1, outlined: true)[${section.chapter.title}] <chapter:${section.chapter.id}>`,
          );
        }
        if (pageData.type === 'contents') {
          body.push(
            `#outline(title: "${publication.book.contents?.title || 'Contents'}", target: selector(heading.where(level: 1)))`,
          );
        } else
          body.push(
            renderSide(pageData, {
              book: publication.book,
              ...page,
              publication,
              imagesRoot: paths.images,
              buildDir,
            }),
          );
        body.push('#pagebreak()');
      }
    }
  }
  return body.join('\n');
}
export function collectStats(publication) {
  const spreads = publication.sections.reduce(
    (n, s) => n + s.spreads.length,
    0,
  );
  const pages = spreads * 2;
  const images = new Set();
  for (const s of publication.sections)
    for (const sp of s.spreads)
      for (const side of ['left', 'right'])
        for (const x of collectImages(sp.data)) images.add(x);
  return {
    chapters: publication.chapters.length,
    spreads,
    pages,
    images: images.size,
  };
}
