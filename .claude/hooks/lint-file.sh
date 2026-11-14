#!/usr/bin/env bash
# PostToolUse (Edit|Write), run in the background: lints the edited source file with the repo's
# ESLint config. On errors it exits 2, which wakes Claude with the report so it fixes them.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null)}"
case "$file" in "$root"/apps/* | "$root"/packages/*) ;; *) exit 0 ;; esac
case "$file" in *.ts | *.js | *.svelte) ;; *) exit 0 ;; esac

cd "$root" || exit 0
if ! output=$(pnpm exec eslint --no-warn-ignored "$file" 2>&1); then
	{
		echo "ESLint found problems in ${file#"$root"/}. Fix them; each message says what to do instead."
		echo "$output"
	} >&2
	exit 2
fi
exit 0
