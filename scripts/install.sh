#!/usr/bin/env bash
set -eu

repo_url="${VIRUS_REPO:-https://github.com/mmenicah84/virus-protocol.git}"
install_dir="${VIRUS_DIR:-virus-protocol}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command git
require_command node
require_command npm

if [ -d "$install_dir/.git" ]; then
  echo "Using existing repository: $install_dir"
else
  git clone "$repo_url" "$install_dir"
fi

cd "$install_dir"
npm install

if [ "${VIRUS_SKIP_TESTS:-0}" != "1" ]; then
  npm test
fi

cat <<'EOF'

VIRUS Runtime is ready.

Next commands:
  npm start
  node ./bin/virus.js run "Analyze an AI agent project" --strain research --mode balanced
  node ./bin/virus.js networks

EOF
