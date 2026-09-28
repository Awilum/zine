import fs from 'node:fs';
import path from 'node:path';
export function cleanCommand(root) {
  for (const dir of ['.build', 'output'])
    fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  return { cleaned: true };
}
