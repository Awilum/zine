import { Layout } from './base.js';
const esc = (s) =>
  String(s ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\n');
const q = (s) => `"${esc(s)}"`;

export class Blank extends Layout {
  constructor() {
    super('blank');
  }
  render() {
    return '#blank_page()';
  }
}
export class Title extends Layout {
  constructor() {
    super('title');
  }
  render(d, c) {
    return `#title_page(${q(d.title)}, subtitle: ${q(d.subtitle || '')}, author: ${q(d.author || c.book.metadata.author)}, location: ${q(d.location || c.book.metadata.location || '')}, year: ${q(d.year || c.book.metadata.year)}, vertical: ${q(c.vertical || 'center')}, horizontal: ${q(c.horizontal || 'center')})`;
  }
}
export class Photo extends Layout {
  constructor() {
    super('photo');
  }
  render(d, c) {
    return `#photo_page(${q(c.imagePath)}, title: ${q(d.title || '')}, caption-text: ${q(d['caption-text'] || d.caption || '')})`;
  }
}
export class Grid extends Layout {
  constructor(name, count) {
    super(name);
    this.count = count;
  }
  render(d, c) {
    const images = c.imagePaths || [];
    if (images.length !== this.count)
      throw new Error(
        `Layout "${this.name}" requires ${this.count} images, got ${images.length}.`,
      );
    const fn = `photos_${this.count}_page`;
    return `#${fn}(${images.map(q).join(', ')})`;
  }
}
export class Text extends Layout {
  constructor() {
    super('text');
  }
  render(d, c) {
    return `#text_page(${q(d.title || '')}, ${q(d.text || '')}, vertical: ${q(c.vertical || 'center')}, horizontal: ${q(c.horizontal || 'center')})`;
  }
}
export class Mixed extends Layout {
  constructor(name) {
    super(name);
  }
  render(d, c) {
    return `#photo_text_page(${q(c.imagePath)}, ${q(d.title || '')}, ${q(d.text || '')}, caption-text: ${q(d['caption-text'] || d.caption || '')}, text-position: ${q(d.textPosition || 'bottom')})`;
  }
}
export class Quote extends Layout {
  constructor() {
    super('quote');
  }
  render(d, c) {
    return `#quote_page(${q(d.text || '')}, vertical: ${q(c.vertical || 'center')}, horizontal: ${q(c.horizontal || 'center')})`;
  }
}
export class Chapter extends Layout {
  constructor() {
    super('chapter');
  }
  render(d, c) {
    const ch = c.chapter;
    if (!ch)
      throw new Error('The chapter layout can only be used inside a chapter.');
    return `#chapter_page(${q(d.title || ch.title)}, subtitle: ${q(d.subtitle || ch.subtitle || '')}, number: ${q(String(ch.number).padStart(2, '0'))})`;
  }
}
export class Contents extends Layout {
  constructor() {
    super('contents');
  }
  render(d, c) {
    return `#contents_page(title: ${q(d.title || c.book.contents?.title || 'Contents')})`;
  }
}
