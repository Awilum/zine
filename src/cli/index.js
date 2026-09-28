#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { parseArgs, has } from './args.js';
import {
  logo,
  header,
  success,
  failure,
  warning,
  interactive,
} from './ui/terminal.js';
import { printHelp } from './commands/help.js';
import { initCommand } from './commands/init.js';
import { buildCommand } from './commands/build.js';
import { previewCommand } from './commands/preview.js';
import { doctorCommand, doctorRoot } from './commands/doctor.js';
import { validateCommand } from './commands/validate.js';
import { editCommand } from './commands/edit.js';
import { cleanCommand } from './commands/clean.js';
import { chaptersCommand } from './commands/chapters.js';
import { findProjectRoot, projectStats } from '../project/index.js';

const VERSION = '3.0.0';
const EXIT = {
  ok: 0,
  general: 1,
  config: 2,
  build: 3,
  validation: 4,
  environment: 5,
};

function json(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + '\n');
}
function currentRoot(positionals) {
  return path.resolve(positionals[0] || findProjectRoot() || process.cwd());
}

async function interactiveHome() {
  const clack = await (async () => {
    try {
      return await import('@clack/prompts');
    } catch {
      return null;
    }
  })();
  if (!clack) {
    printHelp();
    return;
  }
  const project = findProjectRoot();
  if (!project) {
    clack.intro('ZINE');
    const choice = await clack.select({
      message: 'What would you like to do?',
      options: [
        { value: 'init', label: 'Create a new publication' },
        { value: 'open', label: 'Open an existing publication' },
        { value: 'doctor', label: 'Check installation' },
        { value: 'docs', label: 'Documentation' },
      ],
    });
    if (clack.isCancel(choice)) return clack.cancel('Cancelled.');
    if (choice === 'init')
      return initCommand({ directory: undefined, flags: {} });
    if (choice === 'doctor') {
      console.log(logo());
      return doctorCommand(process.cwd());
    }
    if (choice === 'docs') return printHelp();
    return printHelp();
  }
  const stats = projectStats(project);
  clack.intro(`ZINE · ${stats.title}`);
  const choice = await clack.select({
    message: 'What would you like to do?',
    options: [
      { value: 'preview', label: 'Preview' },
      { value: 'build', label: 'Build' },
      { value: 'edit', label: 'Edit' },
      { value: 'chapters', label: 'Chapters' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'info', label: 'Project information' },
      { value: 'exit', label: 'Exit' },
    ],
  });
  if (clack.isCancel(choice) || choice === 'exit') return;
  if (choice === 'preview') return previewCommand(project, {});
  if (choice === 'build') return buildCommand(project, {});
  if (choice === 'edit') return editCommand(project);
  if (choice === 'chapters') return chaptersCommand(project, 'list', {});
  if (choice === 'doctor') return doctorCommand(project);
  return json(stats);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  if (has(flags, 'no-color')) process.env.NO_COLOR = '1';
  const command = positionals.shift();
  if (has(flags, 'version', 'v') || command === 'version')
    return console.log(VERSION);
  if (has(flags, 'help', 'h') || command === 'help')
    return printHelp(positionals[0]);
  if (!command) return interactiveHome();
  if (command === 'init')
    return initCommand({ directory: positionals[0], flags });
  const root = currentRoot(positionals);
  if (command === 'build') {
    try {
      const r = buildCommand(root, flags);
      if (flags.json)
        json({
          ok: true,
          output: r.output,
          pages: r.pages,
          chapters: r.chapters,
          spreads: r.spreads,
          images: r.images,
        });
    } catch (e) {
      failure(e.message);
      process.exitCode = e.message.includes('Typst')
        ? EXIT.environment
        : EXIT.build;
    }
    return;
  }
  if (command === 'preview') {
    try {
      await previewCommand(root, flags);
    } catch (e) {
      failure(e.message);
      process.exitCode = EXIT.build;
    }
    return;
  }
  if (command === 'doctor') {
    try {
      const r = doctorCommand(doctorRoot(root));
      if (flags.json) json(r);
      else {
        header('ZINE Doctor');
        for (const c of r.checks)
          console.log(
            `${c.ok ? '✓' : '✗'} ${c.name}${c.details ? ` — ${c.details}` : ''}`,
          );
        console.log(
          r.healthy ? '\nProject is healthy.' : '\nProject needs attention.',
        );
      }
      if (!r.healthy) process.exitCode = EXIT.validation;
    } catch (e) {
      failure(e.message);
      process.exitCode = EXIT.general;
    }
    return;
  }
  if (command === 'validate') {
    try {
      const r = validateCommand(root);
      if (flags.json) json(r);
      else
        success(
          `Project is valid · ${r.chapters} chapters · ${r.pages} pages · ${r.images} images`,
        );
    } catch (e) {
      if (flags.json) json({ valid: false, error: e.message });
      else failure(e.message);
      process.exitCode = EXIT.validation;
    }
    return;
  }
  if (command === 'info') {
    try {
      const r = projectStats(root);
      if (flags.json) json(r);
      else {
        header(r.title);
        console.log(
          `Author: ${r.author}\nType: ${r.type}\nFormat: ${r.paper} ${r.orientation}\nChapters: ${r.chapters}\nSpreads: ${r.spreads}\nPages: ${r.pages}\nImages: ${r.images}`,
        );
      }
    } catch (e) {
      failure(e.message);
      process.exitCode = EXIT.config;
    }
    return;
  }
  if (command === 'edit') {
    const r = editCommand(root, flags.editor);
    if (r.opened) success(`Opened ${r.editor}: ${r.path}`);
    else
      warning(
        `No supported editor found. Your project is located at:\n${r.path}`,
      );
    return;
  }
  if (command === 'clean') {
    cleanCommand(root);
    success('Generated files removed.');
    return;
  }
  if (command === 'chapters') {
    try {
      const action = positionals[0] || 'list';
      const r = await chaptersCommand(root, action, flags);
      if (flags.json) json(r);
      else if (r.chapters)
        r.chapters.forEach((c) =>
          console.log(`${String(c.number).padStart(2, '0')}  ${c.directory}`),
        );
      else if (r.added) success(`Chapter created: ${r.added}`);
      else if (r.removed) success(`Chapter removed: ${r.removed}`);
    } catch (e) {
      failure(e.message);
      process.exitCode = EXIT.validation;
    }
    return;
  }
  printHelp(command);
  process.exitCode = EXIT.general;
}

main().catch((e) => {
  failure(e.message);
  if (process.env.ZIM_VERBOSE === '1') console.error(e.stack);
  process.exitCode = EXIT.general;
});
