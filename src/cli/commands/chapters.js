import fs from 'node:fs';
import path from 'node:path';
import { loadClack } from '../ui/terminal.js';
import { safeProjectPath } from '../../project/index.js';

function list(root) {
  const base = path.join(root, 'content', 'chapters');
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map((entry, i) => ({
      number: i + 1,
      id: entry.name.replace(/^\d+-/, ''),
      directory: entry.name,
    }));
}

export async function chaptersCommand(root, action, flags) {
  if (!action || action === 'list') return { chapters: list(root) };
  const base = path.join(root, 'content', 'chapters');
  fs.mkdirSync(base, { recursive: true });
  if (action === 'add') {
    let title = flags.title;
    if (!title) {
      const clack = await loadClack();
      if (clack) {
        title = await clack.text({
          message: 'Chapter title',
          defaultValue: 'New Chapter',
        });
        if (clack.isCancel(title)) return { cancelled: true };
      } else title = 'New Chapter';
    }
    const id =
      String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'chapter';
    const n = String(list(root).length + 1).padStart(2, '0');
    const dirName = `${n}-${id}`;
    const dir = safeProjectPath(
      root,
      path.join('content', 'chapters', dirName),
    );
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'chapter.yaml'),
      `id: ${id}\ntitle: ${JSON.stringify(title)}\nsubtitle: New chapter\nopener: true\n`,
    );
    fs.writeFileSync(
      path.join(dir, '001.yaml'),
      'left:\n  type: text\n  title: New chapter\n  text: |\n    Start writing here.\n  vertical: center\n  horizontal: left\nright:\n  type: blank\n',
    );
    return { added: dirName };
  }
  if (action === 'remove') {
    const target = flags.name || flags.id;
    if (!target)
      throw new Error('Usage: zine chapters remove --name 03-people');
    const dir = safeProjectPath(root, path.join('content', 'chapters', target));
    if (!fs.existsSync(dir)) throw new Error(`Chapter not found: ${target}`);
    fs.rmSync(dir, { recursive: true, force: true });
    return { removed: target };
  }
  throw new Error(`Unknown chapters action: ${action}`);
}
