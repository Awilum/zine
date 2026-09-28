import fs from 'node:fs';
import { GenerationError } from './errors.js';
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if ((c === '"' || c === "'") && line[i - 1] !== '\\')
      quote = quote === c ? null : quote ? quote : c;
    if (c === '#' && !quote && (!i || /\s/.test(line[i - 1])))
      return line.slice(0, i);
  }
  return line;
}
function scalar(s) {
  s = s.trim();
  if (!s) return null;
  if (s === '|' || s === '>') return { __block: s };
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  )
    return s.slice(1, -1).replace(/\\n/g, '\n');
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s.startsWith('[') && s.endsWith(']'))
    return s
      .slice(1, -1)
      .split(',')
      .map((x) => scalar(x));
  return s;
}
export function parseYaml(text) {
  const raw = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const lines = raw
    .map((line, i) => {
      const clean = stripComment(line);
      return {
        i,
        indent: (clean.match(/^ */) || [''])[0].length,
        text: clean.trimEnd(),
      };
    })
    .filter((x) => x.text.trim());
  function parseBlock(start, indent) {
    let obj = {};
    let arr = null;
    let i = start;
    while (i < lines.length) {
      const l = lines[i];
      if (l.indent < indent) break;
      if (l.indent > indent)
        throw new Error(`Unexpected indentation near line ${l.i + 1}`);
      const t = l.text.trim();
      if (t.startsWith('- ')) {
        if (!arr) arr = [];
        arr.push(scalar(t.slice(2)));
        i++;
        continue;
      }
      const m = t.match(/^([^:]+):(?:\s*(.*))?$/);
      if (!m) throw new Error(`Invalid YAML near line ${l.i + 1}: ${t}`);
      const key = m[1].trim();
      const rest = m[2] ?? '';
      if (rest === '|' || rest === '>') {
        let j = i + 1,
          vals = [];
        while (j < lines.length && lines[j].indent > indent) {
          vals.push(lines[j].text.slice(Math.min(lines[j].indent, indent + 2)));
          j++;
        }
        obj[key] =
          rest === '|' ? vals.join('\n') + '\n' : vals.join(' ') + '\n';
        i = j;
        continue;
      }
      if (rest === '') {
        if (i + 1 < lines.length && lines[i + 1].indent > indent) {
          const [v, j] = parseBlock(i + 1, lines[i + 1].indent);
          obj[key] = v;
          i = j;
        } else {
          obj[key] = null;
          i++;
        }
      } else {
        obj[key] = scalar(rest);
        i++;
      }
    }
    return [arr ?? obj, i];
  }
  return parseBlock(0, lines[0]?.indent ?? 0)[0];
}
export function loadYaml(file) {
  try {
    return parseYaml(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    if (e instanceof GenerationError) throw e;
    throw new GenerationError(`Invalid YAML: ${file}: ${e.message}`, e);
  }
}
