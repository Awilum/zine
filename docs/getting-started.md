# Getting Started

## 1. Install ZINE

For development:

```bash
npm install
npm link
zine --version
```

## 2. Create a publication

```bash
zine init my-first-zine
cd my-first-zine
```

## 3. Add photographs

Copy your JPG, PNG or WebP files into `images/`.

## 4. Edit the publication

```bash
zine edit
```

Edit the YAML files in the project. The engine is YAML-first so the publication remains portable and versionable.

## 5. Preview

```bash
zine preview
```

## 6. Build

```bash
zine build
```

The PDF appears in `output/`.

## 7. Diagnose problems

```bash
zine doctor
```
