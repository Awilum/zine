import fs from 'node:fs';
import path from 'node:path';
import { loadClack } from '../ui/terminal.js';
import { writeYamlString } from '../../project/index.js';

export const PUBLICATION_TYPES = [
  ['photo-zine', 'Photo Zine'],
  ['photo-book', 'Photo Book'],
  ['travel-guide', 'Travel Guide'],
  ['travel-book', 'Travel Book'],
  ['photo-essay', 'Photo Essay'],
  ['visual-essay', 'Visual Essay'],
  ['artist-book', 'Artist Book'],
  ['portfolio', 'Portfolio'],
  ['journal', 'Journal'],
  ['magazine', 'Magazine'],
  ['field-guide', 'Field Guide'],
  ['custom', 'Custom'],
];

const defaults = {
  'photo-zine': ['01-opening', '02-streets', '03-people'],
  'photo-book': ['01-opening', '02-chapter-one'],
  'travel-guide': ['01-orientation', '02-places'],
  'travel-book': ['01-first-place', '02-second-place'],
  'photo-essay': ['01-opening', '02-observation'],
  'visual-essay': ['01-opening', '02-sequence'],
  'artist-book': ['01-opening', '02-work'],
  portfolio: ['01-selected-work'],
  journal: ['01-days'],
  magazine: ['01-features'],
  'field-guide': ['01-overview'],
  custom: ['01-opening'],
};

function quote(value) {
  return JSON.stringify(String(value));
}
function bookYaml({ id, type, title, author, year, format, font, contents }) {
  return `id: ${writeYamlString(id)}\ntype: ${writeYamlString(type)}\nmetadata:\n  title: ${quote(title)}\n  author: ${quote(author)}\n  year: ${year}\nformat:\n  paper: ${writeYamlString(format)}\n  orientation: portrait\n  margins:\n    top: 18\n    right: 18\n    bottom: 18\n    left: 18\n  bleed: 0\ntypography:\n  font: ${quote(font)}\npagination:\n  enabled: true\n  position: bottom-center\ncontents:\n  enabled: ${contents}\n  title: Contents\nchapter:\n  opener: true\n`;
}

function zineYaml({ id, type, title, author, format, font, contents }) {
  return `id: ${writeYamlString(id)}\ntype: ${writeYamlString(type)}\nmetadata:\n  title: ${quote(title)}\n  author: ${quote(author)}\n  year: 2026\nformat:\n  paper: ${writeYamlString(format)}\n  orientation: portrait\n  margins:\n    top: 18\n    right: 18\n    bottom: 18\n    left: 18\n  bleed: 0\ntypography:\n  font: ${quote(font)}\npagination:\n  enabled: true\n  position: bottom-center\ncontents:\n  enabled: ${contents}\n  title: Contents\nchapter:\n  opener: true\n`;
}

function scaffold(root, options) {
  const chapters = defaults[options.type] ?? defaults.custom;
  const dirs = [
    'publication',
    'publication/content',
    'chapters',
    'images',
    'assets',
    'themes',
    'output',
    '.zine',
    'content/frontmatter',
    'content/chapters',
    'content/backmatter',
  ];
  for (const dir of dirs)
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'zine.yml'), zineYaml(options));
  fs.writeFileSync(
    path.join(root, 'publication', 'metadata.yml'),
    `title: ${quote(options.title)}\nauthor: ${quote(options.author)}\ntype: ${options.type}\n`,
  );
  fs.writeFileSync(path.join(root, 'content', 'book.yaml'), bookYaml(options));
  for (const [index, id] of chapters.entries()) {
    const dir = path.join(root, 'content', 'chapters', id);
    fs.mkdirSync(dir, { recursive: true });
    const cleanId = id.replace(/^\d+-/, '');
    fs.writeFileSync(
      path.join(dir, 'chapter.yaml'),
      `id: ${cleanId}\ntitle: ${cleanId.replaceAll('-', ' ')}\nsubtitle: A starting chapter\nopener: ${index === 0}\n`,
    );
    fs.writeFileSync(
      path.join(dir, '001.yaml'),
      `left:\n  type: ${index === 0 ? 'title' : 'text'}\n  title: ${index === 0 ? options.title : 'Start here'}\n  text: |\n    Replace this example text with your own words, notes, or captions.\n  vertical: center\n  horizontal: left\nright:\n  type: blank\n`,
    );
  }
  fs.writeFileSync(
    path.join(root, 'README.md'),
    `# ${options.title}\n\nCreated with ZINE.\n\nStart with:\n\n    zine preview\n    zine build\n`,
  );
  fs.writeFileSync(
    path.join(root, '.gitignore'),
    'output/\n.build/\n.zine/cache/\n.DS_Store\n',
  );
}

async function askFallback(options) {
  const { createInterface } = await import('node:readline/promises');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (q, d) =>
    (await rl.question(`${q}${d ? ` [${d}]` : ''}: `)).trim() || d;
  const type = await ask('Publication type', options.type ?? 'photo-zine');
  const title = await ask(
    'Title',
    options.title ?? 'My First ZINE Publication',
  );
  const author = await ask('Author', options.author ?? 'Author');
  const format = await ask('Page format', options.format ?? 'a5');
  const font = await ask('Typography', options.font ?? 'Avenir Next');
  const contents =
    (await ask('Create contents? y/n', 'y')).toLowerCase() !== 'n';
  rl.close();
  return { ...options, type, title, author, format, font, contents };
}

export async function initCommand({ directory, flags }) {
  let targetName = directory;
  let options = {
    type: flags.type || 'photo-zine',
    title: flags.title || '',
    author: flags.author || '',
    format: flags.format || 'a5',
    font: flags.font || 'Avenir Next',
    contents: flags.contents === undefined ? true : flags.contents !== 'false',
  };
  const nonInteractive = Boolean(
    flags.type ||
    flags.title ||
    flags.author ||
    flags.format ||
    flags.font ||
    flags.yes ||
    process.env.CI,
  );
  if (!targetName)
    targetName = options.title
      ? options.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : 'my-first-zine';
  if (!nonInteractive) {
    const clack = await loadClack();
    if (clack) {
      const { intro, outro, select, text, confirm, isCancel, cancel } = clack;
      intro('ZINE · New Publication');
      const type = await select({
        message: 'What are you creating?',
        options: PUBLICATION_TYPES.map(([value, label]) => ({ value, label })),
      });
      if (isCancel(type)) return cancel('Cancelled.');
      const title = await text({
        message: 'Publication title',
        placeholder: 'People of Hoi An',
        defaultValue: options.title || undefined,
      });
      if (isCancel(title)) return cancel('Cancelled.');
      const author = await text({
        message: 'Author',
        defaultValue: options.author || 'Author',
      });
      if (isCancel(author)) return cancel('Cancelled.');
      const format = await select({
        message: 'Page format',
        options: ['a5', 'a4', 'letter'].map((value) => ({
          value,
          label: value.toUpperCase(),
        })),
      });
      if (isCancel(format)) return cancel('Cancelled.');
      const font = await text({
        message: 'Typography',
        defaultValue: options.font,
      });
      if (isCancel(font)) return cancel('Cancelled.');
      const contents = await confirm({
        message: 'Include a contents page?',
        initialValue: true,
      });
      if (isCancel(contents)) return cancel('Cancelled.');
      options = { ...options, type, title, author, format, font, contents };
      targetName =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'my-first-zine';
      outro('Ready to create your publication.');
    } else options = await askFallback(options);
  }
  options.title ||= targetName
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  options.author ||= 'Author';
  options.type ||= 'photo-zine';
  const root = path.resolve(targetName);
  if (fs.existsSync(root) && fs.readdirSync(root).length)
    throw new Error(`Directory already exists and is not empty: ${root}`);
  scaffold(root, { ...options, id: path.basename(root) });
  return root;
}
