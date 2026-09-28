import fs from 'node:fs';
import path from 'node:path';
import { ImageError } from './errors.js';
import { IMAGE_EXTENSIONS } from './models.js';
export function resolveImage(imagesRoot, value) {
  if (typeof value !== 'string' || !value.trim())
    throw new ImageError('Image reference must be a non-empty string');
  if (path.isAbsolute(value))
    throw new ImageError(`Absolute image paths are not allowed: ${value}`);
  const full = path.resolve(imagesRoot, value);
  const root = path.resolve(imagesRoot);
  if (full !== root && !full.startsWith(root + path.sep))
    throw new ImageError(`Image path escapes images directory: ${value}`);
  if (!IMAGE_EXTENSIONS.has(path.extname(full).toLowerCase()))
    throw new ImageError(`Unsupported image format: ${value}`);
  if (!fs.existsSync(full)) throw new ImageError(`Image not found: ${value}`);
  return full;
}
export function typstImagePath(buildDir, imagePath) {
  return path.relative(buildDir, imagePath).split(path.sep).join('/');
}
export function validateImageRefs(imagesRoot, refs) {
  return refs.map((x) => resolveImage(imagesRoot, x));
}
