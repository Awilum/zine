# ZINE

**Independent publishing for photographers, travelers and visual creators.**

ZINE turns your photographs, words and ideas into finished visual publications. It is designed for people who want to make a photo zine, photobook, travel guide, photo essay, artist book, portfolio, journal or magazine without having to become software engineers first.

The most important idea is simple:

> **You create a publication. ZINE takes care of the publishing pipeline.**

You do not need to understand Node.js, Typst, the renderer, or the internal engine to use ZINE.

---

## Start here

If you are a photographer with a MacBook and have never used a publishing engine before, start with these four commands:

```bash
zine init my-first-zine
cd my-first-zine
zine preview
zine build
```

Your finished PDF will be in:

```text
output/my-first-zine.pdf
```

If you installed ZINE from this repository during development, you can use:

```bash
npm install
npm link
zine --version
```

The project also keeps `zine` as a compatibility command alias. The product name and primary command are **ZINE**.

---

# What is ZINE?

ZINE is a cross-platform command-line publishing engine for independent visual publications.

It supports:

- photo zines
- photobooks
- travel guides
- travel books
- photo essays
- visual essays
- artist books
- portfolios
- journals
- magazines
- field guides
- custom publications

ZINE is deliberately **spread-first**. A publication is assembled from sections, chapters and spreads. A spread has a left and right page, and each page uses a layout.

```text
Publication
   ↓
Chapters / sections
   ↓
Spreads
   ↓
Pages
   ↓
Layouts
   ↓
ZINE renderer
   ↓
Typst
   ↓
PDF
```

The existing rendering engine remains the source of truth. The CLI is an interface on top of that engine rather than a second publishing system.

---

# Why ZINE exists

Photographers usually want to think about:

- photographs
- sequencing
- chapters
- captions
- typography
- paper size
- rhythm
- the story
- the finished book

They should not have to think about:

- shell scripts
- internal JavaScript files
- renderer internals
- build directories
- command-specific path hacks
- how pages are numbered internally

ZINE therefore separates the **publication** from the **engine**.

A ZINE project contains your publication data. The ZINE installation contains the engine.

```text
ZINE installation
    └── publishing engine

Your publication
    ├── zine.yml
    ├── publication/
    ├── content/
    ├── chapters/
    ├── images/
    ├── assets/
    ├── themes/
    └── output/
```

You can move a publication to another computer without copying the engine into it.

---

# The CLI

The main executable is:

```bash
zine
```

Available commands:

```text
zine init
zine edit
zine preview
zine build
zine doctor
zine validate
zine info
zine chapters
zine clean
zine version
zine help
```

Every command has help:

```bash
zine --help
zine init --help
zine build --help
zine preview --help
zine doctor --help
```

Global options include:

```bash
zine --version
zine --verbose
zine --quiet
zine --no-color
zine --json
```

---

# `zine init` — create a publication

The easiest way to start is the interactive wizard:

```bash
zine init
```

ZINE asks a small number of useful questions:

1. What are you creating?
2. What is the publication title?
3. Who is the author?
4. What page format do you want?
5. What typography should be used?
6. Should a contents page be included?

The interactive interface is built around the same terminal interaction approach used by modern developer CLIs. ZINE uses `@clack/prompts` when installed, with a dependency-free fallback for environments where the optional UI package is not present. Astro itself currently uses `@clack/prompts` in its CLI-facing package, which is why ZINE follows the same style of terminal interaction. citeturn0search0

Example:

```text
ZINE · New Publication

? What are you creating?
❯ Photo Zine
  Photo Book
  Travel Guide
  Travel Book
  Photo Essay
  Visual Essay
  Artist Book
  Portfolio
  Journal
  Magazine
  Field Guide
  Custom

? Publication title: People of Hoi An
? Author: Your Name
? Page format: A5
? Typography: Avenir Next
? Include a contents page? Yes
```

The wizard is not mandatory. Everything can also be scripted.

For example:

```bash
zine init my-book \
  --type photo-book \
  --title "My Book" \
  --author "Your Name" \
  --format a5
```

This is useful for automation, CI systems and AI coding agents.

---

# What `zine init` creates

A new project looks like this:

```text
my-first-zine/
├── zine.yml
├── publication/
│   └── metadata.yml
├── content/
│   ├── book.yaml
│   ├── frontmatter/
│   ├── chapters/
│   │   ├── 01-opening/
│   │   │   ├── chapter.yaml
│   │   │   └── 001.yaml
│   │   └── 02-example/
│   │       ├── chapter.yaml
│   │       └── 001.yaml
│   └── backmatter/
├── chapters/
├── images/
├── assets/
├── themes/
├── output/
├── .zine/
├── .gitignore
└── README.md
```

The existing `content/` structure is intentionally preserved because it is the working architecture of the renderer. New projects also receive the simpler top-level directories that make the project easier to understand.

The engine itself is **not copied into the publication**.

---

# `zine.yml`

`zine.yml` is the human-facing project configuration.

Example:

```yaml
id: people-of-hoi-an
type: photo-zine
metadata:
  title: 'People of Hoi An'
  author: 'Your Name'
  year: 2026
format:
  paper: a5
  orientation: portrait
  margins:
    top: 18
    right: 18
    bottom: 18
    left: 18
  bleed: 0
typography:
  font: 'Avenir Next'
pagination:
  enabled: true
  position: bottom-center
contents:
  enabled: false
  title: Contents
chapter:
  opener: true
```

The existing `content/book.yaml` format remains supported for backwards compatibility. Existing publications do not need to be rewritten just to use the new CLI.

---

# Publication types

ZINE provides templates for:

```text
photo-zine
photo-book
travel-guide
travel-book
photo-essay
visual-essay
artist-book
portfolio
journal
magazine
field-guide
custom
```

The type is a starting point, not a prison. A travel guide can contain full-page photographs. A photo essay can contain chapters. A portfolio can contain long-form text.

The publication type mainly controls the initial project template and example content.

---

# Chapters

Chapters are optional sections of a publication.

A chapter contains metadata and one or more spreads:

```text
content/chapters/02-hanoi/
├── chapter.yaml
├── 001.yaml
├── 002.yaml
└── 003.yaml
```

A chapter definition can be as simple as:

```yaml
id: hanoi
title: Hanoi
subtitle: The city between memory and motion
opener: true
```

Use the CLI to inspect chapters:

```bash
zine chapters
```

Create one:

```bash
zine chapters add
```

Or automate it:

```bash
zine chapters add --title "Hoi An"
```

Remove one:

```bash
zine chapters remove --name 03-people
```

---

# Spreads and layouts

A spread is two pages:

```yaml
left:
  type: photo
  image: hanoi-001.jpg

right:
  type: text
  title: Morning
  text: |
    Hanoi wakes slowly between old streets and new movement.
  vertical: center
  horizontal: left
```

Built-in layouts currently include:

- `blank`
- `title`
- `photo`
- `photos-2`
- `photos-3`
- `photos-4`
- `text`
- `photo-text`
- `text-photo`
- `quote`
- `chapter`
- `contents`

Text-only layouts support vertical and horizontal alignment.

Image and mixed layouts intentionally do not expose arbitrary page alignment. They are treated as complete visual compositions by the renderer.

---

# Images

Put photographs in:

```text
images/
```

Then reference them from a spread:

```yaml
left:
  type: photo
  image: street.jpg
```

ZINE validates image paths and prevents image references from escaping the project image directory.

Supported image formats in the current engine are:

```text
.jpg
.jpeg
.png
.webp
```

---

# `zine edit`

`zine edit` opens the current publication in a supported editor.

Priority:

1. Zed
2. VS Code
3. Cursor

Use an explicit editor when necessary:

```bash
zine edit --editor vscode
zine edit --editor cursor
zine edit --editor zed
```

If no supported editor is installed, ZINE does not treat that as a publication error. It simply prints the project location so you can open it manually.

---

# `zine preview`

Preview is designed to be the photographer's normal feedback loop:

```bash
zine preview
```

ZINE validates and builds the publication, starts a local HTTP server and opens the browser.

The preview is deliberately built on the existing publishing renderer. It does not introduce a second page-layout engine.

The local server displays the generated PDF in a simple browser viewer and exposes a health endpoint for automation.

Example:

```text
ZINE Preview
Local server: http://localhost:4173
Watching: /Users/you/Projects/my-book
Press Ctrl+C to stop.
```

---

# `zine build`

Build a PDF with:

```bash
zine build
```

The pipeline is:

```text
validate
   ↓
load publication
   ↓
collect chapters
   ↓
resolve images
   ↓
resolve layouts
   ↓
render Typst
   ↓
compile PDF
```

The result is placed in:

```text
output/
```

You can choose another output directory:

```bash
zine build --output ./dist
```

Other useful options:

```bash
zine build --clean
zine build --verbose
zine build --production
```

The existing renderer and Typst pipeline remain the source of truth. The CLI does not implement a second builder.

---

# `zine validate`

Validation checks the publication without producing a PDF:

```bash
zine validate
```

It catches problems such as:

- invalid configuration
- unsupported page formats
- invalid alignment values
- invalid text positions
- missing chapters
- invalid chapter metadata
- missing images
- unsupported image formats
- unknown layouts

For automation:

```bash
zine validate --json
```

---

# `zine doctor`

Doctor is the diagnostic command:

```bash
zine doctor
```

It checks:

- project configuration
- publication schema
- chapters
- layouts
- image references
- renderer health
- Typst availability
- output directory

A healthy project looks like:

```text
ZINE Doctor
──────────────────────────────────────────────
✓ Project directory
✓ Configuration
✓ Publication schema
✓ Chapters — 3 chapters
✓ Layouts — 48 pages
✓ Images — 27 referenced images
✓ Theme / template
✓ Typst — Typst 0.x.x
✓ Output directory

Project is healthy.
```

A failure is written for humans, not just machines:

```text
✗ Image not found
  images/people/portrait-07.jpg

Referenced by:
  content/chapters/03-people/002.yaml

Fix:
  Add the image or update the image path.
```

For scripts and AI agents:

```bash
zine doctor --json
```

JSON mode never mixes decorative terminal output into the JSON document.

---

# `zine info`

Show publication information:

```bash
zine info
```

Or:

```bash
zine info --json
```

Example information includes:

- title
- author
- publication type
- paper
- orientation
- chapters
- spreads
- pages
- referenced images

---

# Exit codes

ZINE uses predictable exit codes:

```text
0  success
1  general error
2  invalid project or configuration
3  build error
4  validation error
5  environment or dependency error
```

This makes ZINE suitable for scripts and automated workflows.

---

# Cross-platform design

ZINE is designed for:

- macOS
- Linux
- Windows

The JavaScript runtime uses Node.js APIs rather than shell-specific commands for filesystem operations.

The CLI does not require Bash, Zsh, PowerShell, Homebrew or Apt as part of its core architecture.

Browser and editor launching is abstracted by platform detection.

Color and interactive UI automatically degrade in CI and non-TTY environments.

Set:

```bash
NO_COLOR=1
```

to disable terminal colors.

---

# Installation modes

## Development installation

From the ZINE source repository:

```bash
npm install
npm link
zine --version
```

This is the recommended mode for contributors and developers.

## Local script installation

On macOS or Linux:

```bash
./scripts/install.sh
```

On Windows PowerShell:

```powershell
./scripts/install.ps1
```

These scripts create a small user-level command shim and do not require a system-wide package manager.

## Standalone distribution

The project is structured so the CLI can be packaged with a Node.js runtime for end users. The application itself does not depend on Node.js being globally available once a runtime-bundled executable is produced.

The build entry point is:

```bash
npm run build:cli
```

Platform artifacts are intended to follow this naming convention:

```text
zine-macos-arm64
zine-macos-x64
zine-linux-x64
zine-linux-arm64
zine-windows-x64.exe
```

The source CLI remains cross-platform and the repository does not require a DMG as its distribution mechanism.

---

# Demos

All demonstration publications live in one directory:

```text
Publications/
```

This is intentional: the demo directory is a small collection of real ZINE projects rather than a collection of unrelated engine tests.

Current examples include:

```text
Publications/
├── publication/
├── complete-demo/
├── full-demo/
├── photo-essay/
├── travel-book/
├── travel-guide/
├── travel-journal/
└── zine/
```

The content is fictional and designed to demonstrate the publishing system using neutral Vietnam-inspired editorial text and generated pattern images.

To build an example:

```bash
zine build Publications/publication
```

To inspect it:

```bash
zine info Publications/travel-book
zine doctor Publications/complete-demo
```

---

# Project architecture

The repository intentionally separates the CLI from the engine:

```text
src/
├── cli/
│   ├── commands/
│   ├── ui/
│   └── index.js
└── project/

engine/
├── generator/
│   ├── layouts/
│   ├── chapters.js
│   ├── images.js
│   ├── publication.js
│   ├── registry.js
│   ├── validation.js
│   └── typst.js
└── templates/
```

The architectural rule is:

```text
CLI
 ↓
Project API
 ↓
ZINE Engine
 ↓
Renderer
 ↓
Typst / PDF
```

There must not be two independent build engines.

This makes it possible to add a future GUI, VS Code extension, web editor or Tauri frontend without rewriting the renderer.

---

# Existing project compatibility

The current engine historically used:

```text
content/book.yaml
content/spreads/
content/frontmatter/
content/chapters/
content/backmatter/
```

That structure remains supported.

Chapter projects continue to work.

Legacy spread-only projects continue to work.

The existing layout registry remains in place.

The existing Typst template remains in place.

The new CLI is an integration layer rather than a rewrite of the renderer.

The original `build.sh` remains as a compatibility wrapper.

---

# Tests

Run the engine tests:

```bash
npm test
```

Run CLI tests:

```bash
npm run test:cli
```

The tests cover the existing renderer as well as CLI behavior such as:

- version
- help
- project validation
- doctor
- project information
- chapter handling
- invalid projects
- layout validation

---

# For developers

The public API is deliberately small.

Important operations include:

```js
loadProject(path);
validateProject(project);
buildProject(project, options);
previewProject(project, options);
createProject(options);
listChapters(project);
addChapter(project, options);
```

The current implementation exposes the underlying engine through reusable modules rather than putting build logic directly inside command handlers.

When extending ZINE, keep this rule:

> **Commands orchestrate. The engine renders. Projects contain data.**

---

# Security

Publication files are treated as data.

ZINE does not execute arbitrary JavaScript from `zine.yml` or chapter files.

Project paths are normalized and checked before filesystem operations.

Image references cannot escape the project's image directory.

Build and clean operations operate inside the selected project rather than accepting arbitrary filesystem commands from publication configuration.

---

# Philosophy

ZINE is not intended to be a programming exercise disguised as a publishing tool.

The result matters more than the implementation.

A photographer should be able to think:

> **I am making a book.**

not:

> I am operating a Node.js build pipeline.

The engine should be structured enough for developers to extend, but simple enough that a photographer can create a publication without learning the engine's internals.

---

# License

MIT. See `LICENSE`.
