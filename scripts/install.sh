#!/usr/bin/env sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BIN_DIR="${ZIM_BIN_DIR:-$HOME/.local/bin}"
mkdir -p "$BIN_DIR"
cat > "$BIN_DIR/zine" <<EOF2
#!/usr/bin/env sh
exec "$ROOT/src/cli/index.js" "\$@"
EOF2
chmod +x "$BIN_DIR/zine"
"$BIN_DIR/zine" --version
case ":${PATH:-}:" in *":$BIN_DIR:"*) ;; *) echo "Add $BIN_DIR to PATH if it is not already there." ;; esac
