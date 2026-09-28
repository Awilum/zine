import { ValidationError } from './errors.js';
import {
  SUPPORTED_PAPERS,
  SUPPORTED_ORIENTATIONS,
  TEXT_LAYOUTS,
  IMAGE_LAYOUTS,
  MIXED_LAYOUTS,
  TEXT_POSITIONS,
} from './models.js';
const V = new Set(['top', 'center', 'bottom']);
const H = new Set(['left', 'center', 'right']);
const req = (o, k, c = 'value') => {
  if (!o || typeof o[k] !== 'string' || !o[k].trim())
    throw new ValidationError(`${c}.${k} must be a non-empty string`);
};
export function validateBook(book) {
  if (!book || typeof book !== 'object')
    throw new ValidationError('book.yaml must contain an object');
  req(book, 'id', 'book');
  if (!book.metadata || typeof book.metadata !== 'object')
    throw new ValidationError('book.metadata is required');
  req(book.metadata, 'title', 'book.metadata');
  req(book.metadata, 'author', 'book.metadata');
  if (book.metadata.year === undefined)
    throw new ValidationError('book.metadata.year is required');
  if (!book.format) throw new ValidationError('book.format is required');
  const p = String(book.format.paper || '').toLowerCase();
  if (!SUPPORTED_PAPERS.has(p))
    throw new ValidationError(`Unsupported paper: ${p}`);
  const o = String(book.format.orientation || '').toLowerCase();
  if (!SUPPORTED_ORIENTATIONS.has(o))
    throw new ValidationError(`Unsupported orientation: ${o}`);
  for (const k of ['top', 'right', 'bottom', 'left']) {
    const n = book.format.margins?.[k];
    if (typeof n !== 'number' || n < 0 || n > 100)
      throw new ValidationError(`format.margins.${k} must be 0..100`);
  }
  if (
    typeof (book.format.bleed ?? 0) !== 'number' ||
    book.format.bleed < 0 ||
    book.format.bleed > 20
  )
    throw new ValidationError('format.bleed must be 0..20');
  if (
    book.typography?.font !== undefined &&
    typeof book.typography.font !== 'string'
  )
    throw new ValidationError('typography.font must be a string');
  return book;
}
export function validateVertical(v) {
  if (!V.has(v)) throw new ValidationError(`Invalid vertical alignment: ${v}`);
  return v;
}
export function validateHorizontal(v) {
  if (!H.has(v))
    throw new ValidationError(`Invalid horizontal alignment: ${v}`);
  return v;
}
export function getVerticalAlignment(d) {
  return d?.vertical ?? 'center';
}
export function getHorizontalAlignment(d) {
  return d?.horizontal ?? 'center';
}
export function validateTextPosition(v) {
  if (!TEXT_POSITIONS.has(v))
    throw new ValidationError(`Invalid textPosition: ${v}`);
  return v;
}
export function getTextPosition(d) {
  return d?.textPosition ?? 'bottom';
}
export function rejectPageAlignment(d) {
  if (d?.vertical !== undefined || d?.horizontal !== undefined)
    throw new ValidationError(
      'vertical/horizontal alignment is only available for text layouts (title, text, quote, chapter, contents). Image and mixed layouts are always centered as compositions.',
    );
}
export function validateSpread(spread) {
  if (!spread || typeof spread !== 'object')
    throw new ValidationError('Spread must be an object');
  for (const side of ['left', 'right']) {
    const d = spread[side];
    if (!d || typeof d !== 'object')
      throw new ValidationError(`spread.${side} is required`);
    if (typeof d.type !== 'string')
      throw new ValidationError(`spread.${side}.type is required`);
    const t = d.type;
    if (TEXT_LAYOUTS.has(t)) {
      if (d.vertical !== undefined) validateVertical(d.vertical);
      if (d.horizontal !== undefined) validateHorizontal(d.horizontal);
    } else if (MIXED_LAYOUTS.has(t)) {
      rejectPageAlignment(d);
      if (d.textPosition !== undefined) validateTextPosition(d.textPosition);
    } else if (IMAGE_LAYOUTS.has(t)) {
      rejectPageAlignment(d);
    }
  }
  return spread;
}
export function getFormatOptions(book) {
  return {
    paper: String(book.format.paper).toLowerCase(),
    flipped: book.format.orientation === 'landscape',
    margins: book.format.margins,
    bleed: book.format.bleed ?? 0,
    font: book.typography?.font ?? 'Avenir Next',
  };
}
