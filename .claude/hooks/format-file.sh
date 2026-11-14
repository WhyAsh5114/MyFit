#!/usr/bin/env bash
# PostToolUse (Edit|Write): formats the edited file with the repo's Prettier config.
# Silent on success; never blocks the edit.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null)}"
case "$file" in "$root"/*) ;; *) exit 0 ;; esac

cd "$root" && pnpm exec prettier --write --ignore-unknown --log-level=warn "$file" >/dev/null 2>&1
exit 0
