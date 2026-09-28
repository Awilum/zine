import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const candidates = [
  ['zed', 'Zed'],
  ['code', 'VS Code'],
  ['cursor', 'Cursor'],
];

function available(command) {
  const paths = (process.env.PATH || '').split(path.delimiter);
  const extensions = process.platform === 'win32' ? ['', '.cmd', '.exe'] : [''];
  return extensions.some((ext) =>
    paths.some((dir) => fs.existsSync(path.join(dir, command + ext))),
  );
}

export function editCommand(root, requested) {
  const list = requested
    ? candidates.filter(([id]) => id === requested)
    : candidates;
  const found = list.find(([id]) => available(id));
  if (!found) return { opened: false, editor: null, path: root };
  const child = spawn(found[0], [root], { detached: true, stdio: 'ignore' });
  child.unref();
  return { opened: true, editor: found[1], path: root };
}
