import process from 'node:process';

export const interactive = Boolean(
  process.stdin.isTTY && process.stdout.isTTY && !process.env.CI,
);
export const noColor =
  process.env.NO_COLOR === '1' ||
  process.env.TERM === 'dumb' ||
  !process.stdout.isTTY;

const ansi = (code, value) =>
  noColor ? value : `\x1b[${code}m${value}\x1b[0m`;
export const bold = (s) => ansi('1', s);
export const dim = (s) => ansi('2', s);
export const cyan = (s) => ansi('36', s);
export const green = (s) => ansi('32', s);
export const yellow = (s) => ansi('33', s);
export const red = (s) => ansi('31', s);
export const gray = (s) => ansi('90', s);

export function logo() {
  return [
    '╭──────────────────────────────────────────────╮',
    '│                     ZINE                      │',
    '│        Independent Publishing Engine         │',
    '╰──────────────────────────────────────────────╯',
  ].join('\n');
}

export function header(title, subtitle = '') {
  console.log(`\n${bold(cyan(title))}`);
  if (subtitle) console.log(dim(subtitle));
  console.log(dim('──────────────────────────────────────────────'));
}

export function success(message) {
  console.log(`${green('✓')} ${message}`);
}
export function warning(message) {
  console.log(`${yellow('!')} ${message}`);
}
export function failure(message) {
  console.error(`${red('✗')} ${message}`);
}

export async function loadClack() {
  try {
    return await import('@clack/prompts');
  } catch {
    return null;
  }
}
