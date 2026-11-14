---
paths:
  - 'apps/frontend/src/**/*.svelte'
  - 'apps/frontend/src/routes/layout.css'
  - 'apps/frontend/messages/*.json'
---

<!-- Loads when Claude reads or edits UI files. Replaces the old `ui` skill: loading is guaranteed instead of model-judged. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). Keep the steps here; keep the rules in DESIGN.md. -->

# UI work

Before changing UI, read `DESIGN.md` in full (how the app looks and behaves) and `docs/reference/frontend.md` (Svelte, components, forms, i18n). Then:

1. Name the surface your change uses (page, responsive dialog, dialog, menu) and why, from DESIGN.md → Surfaces.
2. Match the nearest existing screen that does the same job before writing new markup.
3. Build from `#lib/components/ui/`. A component added with the shadcn CLI loses our local edits; re-apply DESIGN.md → "Customised shadcn components".
4. Put every string in `messages/en.json` and `messages/hi.json`.
5. Run `pnpm --filter @myfit/frontend screenshots` and look at every screen you changed, light and dark. Add a `shot(...)` in `apps/frontend/tests/screenshots/screens.spec.ts` for a new screen.
6. Check DESIGN.md → "Reviewing a screen" item by item, and report any item you could not check.

When DESIGN.md is silent, make the smallest choice consistent with its priorities and add it to DESIGN.md.
