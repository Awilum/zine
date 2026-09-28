# Contributing

Before changing the CLI, inspect the engine and run the existing tests.

```bash
npm test
npm run test:cli
```

Keep the separation:

```text
CLI → Project API → Engine → Renderer
```

Prefer Node.js filesystem/process APIs over shell-specific commands.
