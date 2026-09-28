import { bold, cyan, dim } from '../ui/terminal.js';

const commands = [
  ['init [directory]', 'Create a new publication with the interactive wizard'],
  ['edit [path]', 'Open the publication in a supported editor'],
  ['preview [path]', 'Build and serve a local browser preview'],
  ['build [path]', 'Build the publication as a PDF'],
  ['doctor [path]', 'Diagnose the project and its environment'],
  ['validate [path]', 'Validate the project without building a PDF'],
  ['info [path]', 'Show publication information'],
  ['chapters [path]', 'List or manage publication chapters'],
  ['clean [path]', 'Remove generated build and output files'],
  ['version', 'Show the ZINE version'],
  ['help [command]', 'Show help'],
];

export function printHelp(command) {
  if (command) return printCommandHelp(command);
  console.log(
    `\n${bold(cyan('ZINE'))} — independent publishing for photographers\n`,
  );
  console.log(
    'Create books, zines, travel guides, photo essays and other visual publications.\n',
  );
  console.log(`${bold('Usage')}\n  zine <command> [path] [options]\n`);
  console.log(bold('Commands'));
  for (const [name, description] of commands)
    console.log(`  ${name.padEnd(22)} ${description}`);
  console.log(
    `\n${bold('Global options')}\n  --help                 Show help\n  --version              Show version\n  --verbose              Show technical details\n  --quiet                Reduce output\n  --no-color             Disable terminal colors\n  --json                 Machine-readable output where supported\n`,
  );
  console.log(dim('Start with: zine init my-first-zine'));
}

function printCommandHelp(command) {
  const docs = {
    init: 'zine init [directory] [--type photo-zine] [--title "My Book"] [--author "Author"] [--format a5]\n\nCreates a complete project without copying the ZINE engine into it.',
    build:
      'zine build [path] [--output ./dist] [--clean] [--verbose] [--production]\n\nValidates, renders and compiles the publication to PDF.',
    preview:
      'zine preview [path] [--port 4173]\n\nBuilds the publication, starts a local HTTP server and opens the browser.',
    doctor:
      'zine doctor [path] [--json]\n\nChecks configuration, chapters, assets, layouts, Typst and the output environment.',
    validate:
      'zine validate [path] [--json]\n\nRuns project validation without compiling a PDF.',
    edit: 'zine edit [path] [--editor zed|vscode|cursor]\n\nOpens the project in a supported editor.',
    chapters:
      'zine chapters [path] [list|add|remove]\n\nLists chapters or creates/removes chapter directories.',
    info: 'zine info [path] [--json]\n\nDisplays publication metadata and build statistics.',
    clean:
      'zine clean [path]\n\nRemoves generated .build and output artifacts.',
  };
  console.log(
    `\n${bold(cyan('zine ' + command))}\n\n${docs[command] ?? 'No detailed help is available for this command.'}\n`,
  );
}
