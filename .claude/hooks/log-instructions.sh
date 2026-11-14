#!/usr/bin/env bash
# InstructionsLoaded: when MYFIT_LOG_INSTRUCTIONS=1, appends which CLAUDE.md or rule file loaded,
# and why, to .claude/instructions.log. Use it to check that a path-scoped rule fires.
[ "${MYFIT_LOG_INSTRUCTIONS:-}" = "1" ] || exit 0
root="${CLAUDE_PROJECT_DIR:-.}"
jq -c --arg at "$(date '+%F %T')" '{at: $at} + (. | del(.session_id, .transcript_path))' \
	>>"$root/.claude/instructions.log" 2>/dev/null
exit 0
