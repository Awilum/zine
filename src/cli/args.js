export function parseArgs(argv) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (token.startsWith('--')) {
      const raw = token.slice(2);
      if (raw.includes('=')) {
        const [k, ...rest] = raw.split('=');
        flags[k] = rest.join('=');
        continue;
      }
      if (argv[i + 1] && !argv[i + 1].startsWith('-')) flags[raw] = argv[++i];
      else flags[raw] = true;
      continue;
    }
    if (token.startsWith('-') && token.length > 1) {
      for (const key of token.slice(1).split('')) flags[key] = true;
      continue;
    }
    positionals.push(token);
  }
  return { positionals, flags };
}

export function has(flags, ...names) {
  return names.some((n) => flags[n] === true || flags[n] !== undefined);
}
