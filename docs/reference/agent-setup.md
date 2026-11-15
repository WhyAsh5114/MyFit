# Agent setup

How coding agents get MyFit's conventions, and where to change each piece. The rule of thumb: enforce what a tool can check, load what applies to the files being touched, and write down only the rest.

| Piece                               | What it does                                                                                     | Loaded                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `CLAUDE.md`                         | The map: what MyFit is, which doc to read for which task, rules for every task                   | Every session                                      |
| `AGENTS.md`                         | A symlink to `CLAUDE.md`, so Codex, Cursor and other agents read the same file                   | By agents that read `AGENTS.md`                    |
| `.claude/rules/*.md`                | A short instruction per area of the code, naming the doc to read before changing it              | When a file matching its `paths` is read or edited |
| `docs/`, `DESIGN.md`, `GLOSSARY.md` | The rules themselves (see [`docs/README.md`](../README.md))                                      | When a rule or `CLAUDE.md` sends the agent there   |
| `eslint.config.js`                  | The rules a tool can check, each with a message that says what to do instead                     | On `pnpm lint`, and after every edit (hook)        |
| `.claude/settings.json`             | Shared permissions and hooks                                                                     | Every Claude Code session                          |
| `.claude/skills/`                   | Workflows you invoke (`/grill-me`, `/improve-codebase-architecture`) and the references they use | On demand                                          |
| `CLAUDE.local.md`                   | Your own notes for this repo. Ignored by git                                                     | Every session, for you only                        |

## Path-scoped rules

| Rule              | Fires on                                                                                     | Sends the agent to                                       |
| ----------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `ui.md`           | `.svelte` files, `layout.css`, `messages/*.json`                                             | `DESIGN.md`, `frontend.md`, and the UI steps in the rule |
| `data.md`         | features, `lib/data`, sync invalidation, `+page.ts`, `+layout.ts`                            | `data-layer.md`                                          |
| `architecture.md` | any app source                                                                               | `architecture.md`                                        |
| `testing.md`      | tests and Playwright configs                                                                 | `testing.md`, `run-tests.md`                             |
| `schema.md`       | `schema.prisma` and migrations                                                               | `change-the-schema.md`, `updates.md`                     |
| `accounts.md`     | account services and components, login, the app layouts, `hooks.client.ts`                   | `accounts.md`                                            |
| `updates.md`      | service worker, OTA, Capacitor config, the sync worker, sync and OTA routes, the sync server | `updates.md`, `release.md`                               |
| `chat.md`         | chat feature, route and API                                                                  | `chat.md`                                                |
| `docs.md`         | any Markdown                                                                                 | `writing.md`, `GLOSSARY.md`                              |

Two Claude Code behaviors shape how a rule is written (checked on 2.1.325):

- **Write the rule as text that names the doc; don't `@import` it.** An `@import` inside a rule loads at session start whatever `paths` says, so it would put every doc in every session. The rule's own text is what waits for a matching file.
- **Avoid `(` and `[` in `paths`.** SvelteKit's `(app)` and `[date]` folders don't match reliably as literals; use `*` or `**` across them.

## Hooks and permissions

`.claude/settings.json` holds the shared setup:

- **After every Edit or Write**, `.claude/hooks/format-file.sh` runs Prettier on the file, and `.claude/hooks/lint-file.sh` runs ESLint on it in the background. Lint errors wake the agent with the report, so it fixes them before moving on. A `.svelte` file takes about 8 seconds to lint (type-aware), which is why that hook runs in the background.
- **`git commit` and `git push` always ask**, even when another settings file allows them.
- **`MYFIT_LOG_INSTRUCTIONS=1`** makes `.claude/hooks/log-instructions.sh` append each loaded instruction file, and why it loaded, to `.claude/instructions.log`. Use it to check that a rule fires.

Personal permissions go in `.claude/settings.local.json` (ignored by git).

## Keeping it healthy

- The docs are authoritative, so the reference docs hold no list of tolerated exceptions. Code that breaks a rule gets fixed. The one tracked list is `DESIGN.md` → Known gaps, for screens that need design work before they can comply; delete an item when its fix lands.
- When an agent keeps getting something wrong, fix it at the strongest level that works: a lint rule or test, then a path rule, then a doc.
- Write lint rules to cover new code by default (a glob over every feature, not a list of today's folders), so a new feature can't fall outside them.
- Keep `CLAUDE.md` a map of about 120 lines at most. Rules for one area go in `.claude/rules/`; the content goes in `docs/`.
- Run `/doctor prompt-audit` in Claude Code now and then. It reports stale or conflicting instructions across these files.
- After moving a doc, update the rules that name it: `grep -rn "docs/" .claude/rules`.
