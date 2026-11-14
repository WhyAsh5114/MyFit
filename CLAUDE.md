# MyFit — Agent Instructions

<!-- AGENTS.md is a symlink to this file, so every agent reads the same instructions. Edit CLAUDE.md. Keep it a short map (under ~120 lines): rules live in docs/. -->

MyFit is a local-first, mobile-first nutrition tracker: a SvelteKit SPA (no SSR) wrapped by Capacitor for iOS and Android, a Hono API, and one Prisma schema shared by IndexedDB on the device and PostgreSQL on the server. User data is written to IndexedDB first and synced in the background.

This file is a map. The rules live in `docs/` (index: [`docs/README.md`](docs/README.md)); read the doc for your task before writing code.

## Before you start, read

| When you are…                                            | Read                                                                                                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Deciding where a file goes or how to split code          | [`docs/reference/architecture.md`](docs/reference/architecture.md)                                                                        |
| Reading or writing user data, adding a query or mutation | [`docs/reference/data-layer.md`](docs/reference/data-layer.md)                                                                            |
| Writing Svelte, a form, i18n strings, or Capacitor code  | [`docs/reference/frontend.md`](docs/reference/frontend.md)                                                                                |
| Building or changing anything the user sees              | [`DESIGN.md`](DESIGN.md) and the steps in [`.claude/rules/ui.md`](.claude/rules/ui.md)                                                    |
| Writing or changing a test                               | [`docs/reference/testing.md`](docs/reference/testing.md)                                                                                  |
| Adding a new kind of user data                           | [`docs/how-to/add-a-feature.md`](docs/how-to/add-a-feature.md)                                                                            |
| Changing `schema.prisma`                                 | [`docs/how-to/change-the-schema.md`](docs/how-to/change-the-schema.md), then [`docs/explanation/updates.md`](docs/explanation/updates.md) |
| Touching accounts, login, logout or the tab lock         | [`docs/explanation/accounts.md`](docs/explanation/accounts.md)                                                                            |
| Touching sync, OTA, the service worker or versions       | [`docs/explanation/updates.md`](docs/explanation/updates.md)                                                                              |
| Touching the chat or its tools                           | [`docs/explanation/chat.md`](docs/explanation/chat.md)                                                                                    |
| Writing any doc, README, skill or comment                | [`docs/reference/writing.md`](docs/reference/writing.md)                                                                                  |
| Naming a product concept                                 | [`GLOSSARY.md`](GLOSSARY.md)                                                                                                              |

## Rules for every task

- **Follow the existing pattern.** Find the nearest example of what you are adding (a reader, a mutation, a route, a test) and match it. When a task seems to need a new pattern, say so and ask before inventing one.
- **Local data flows one way.** A route's `load` reads IndexedDB through a `defineReader` reader; a component writes through a `use…` mutation hook from `lib/features`. TanStack Query is only for remote and device reads.
- **Every user-visible string goes through Paraglide**, in `messages/en.json` and `messages/hi.json`.
- **UI comes from `#lib/components/ui/`** and follows `DESIGN.md`. Look at the screens you changed with `pnpm --filter @myfit/frontend screenshots`.
- **Test at the layer `docs/reference/testing.md` names**, through the public interface. A bug fix starts with a failing test.
- **Update the doc in the same change as the code.** If you made a decision the docs don't cover, add it to the one doc where it belongs.
- **When this file, `DESIGN.md` and the code disagree, ask.** Don't pick one silently.
- **Commit only when the user asks.**

ESLint enforces the mechanical rules (readers, IDB access from routes, `bits-ui` imports, pure `lib/domain`, `../../../../` imports, hardcoded text in markup; strings built in scripts and toasts are still on you). A lint error's message says what to do instead; fix the code rather than disabling the rule.

## Before you finish

Run from the repository root, and report anything that fails:

```bash
pnpm lint      # Prettier + ESLint
pnpm check     # svelte-check and tsc
pnpm --filter @myfit/frontend test
```

Run the API, e2e or screenshot suites when your change touches them ([`docs/how-to/run-tests.md`](docs/how-to/run-tests.md)).

## Repository

```
apps/frontend      SvelteKit + Capacitor app       (src/routes, src/lib/{features,domain,data,services,clients,components})
apps/api           Hono API, better-auth, sync     (src/features/{area})
packages/shared    Prisma schema, contracts, sync server (@myfit/shared)
docs/              how-to, reference, explanation, adr
.claude/skills/    project skills (also at .agents/skills)
```

| Concern    | Library                                                     |
| ---------- | ----------------------------------------------------------- |
| Framework  | SvelteKit 3, Svelte 5 (runes)                               |
| Styling    | Tailwind CSS v4, shadcn-svelte (bits-ui)                    |
| Charts     | layerchart                                                  |
| Data       | SvelteKit `load` (local), TanStack Svelte Query v6 (remote) |
| Forms      | sveltekit-superforms + Zod 4                                |
| Local DB   | Prisma IDB client (IndexedDB)                               |
| Remote API | Hono RPC (`hc<AppType>`)                                    |
| Auth       | better-auth (email OTP + anonymous)                         |
| i18n       | Paraglide JS                                                |
| Mobile     | Capacitor 8                                                 |
| Dates      | `@internationalized/date`                                   |

## Skills

`.claude/skills/README.md` lists them. Use `grill-me` to stress-test a plan before building it, and `improve-codebase-architecture` to look for refactors.

How the agent setup fits together (rules, hooks, permissions, skills) is in [`docs/reference/agent-setup.md`](docs/reference/agent-setup.md).
