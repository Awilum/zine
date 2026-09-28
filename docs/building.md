# Building ZINE

The canonical build path is:

```text
validate → collect → resolve assets → render Typst → compile PDF
```

The CLI calls the existing generator. Do not implement a second builder in command handlers.

`build.sh` remains as a compatibility wrapper.

## Typst

The existing engine uses Typst for final PDF compilation. The source repository therefore keeps Typst as an external build capability rather than rewriting the renderer.

A production standalone release should ship the matching Typst executable alongside the ZINE runtime for each target platform. This keeps the end user's workflow independent from Node.js, npm and system package managers.
