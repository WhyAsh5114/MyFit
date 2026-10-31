# MyFit — Design Language

Status: v0.1, decided 2026-10-30. Decisions came from a Q&A with the owner, backed by mocks of the real screens. Open questions are at the end.

This file answers "how should this look and behave?". `AGENTS.md` answers "how is the code structured?". When they seem to disagree, ask; don't guess.

## How to use this file

Resolve a design question in this order:

1. **This file.** Product-specific decisions win.
2. **Platform guidance** where this file is silent: Apple HIG and Material Design 3 for behavior, touch, and navigation.
3. **Accessibility**: WCAG 2.2 AA is the floor, not a goal. Nothing here may go below it.
4. **General craft**: Nielsen's heuristics, Norman's feedback and signifiers, _Refactoring UI_ for hierarchy and spacing, Nielsen Norman Group for "when to use X over Y".

If a decision isn't covered, make the smallest choice consistent with the priorities below, then add it here.

## Who it's for

Serious macro trackers. They care about precise protein, carbs and fat, adjust targets, and review trends. They log on a phone, often one-handed, in short bursts, and expect it to work offline. They want accuracy without friction.

Design for this person, not a casual dieter. That means numbers first, no hand-holding, no guilt.

## Priorities

When two goals conflict, the higher one wins.

1. **Speed of logging.** Fewest taps and seconds to record a meal. Detail and accuracy controls may sit one level deeper, never in the way.
2. **Precision.** Show real numbers with their targets and units. Never trade a number for an adjective.
3. **Calm.** Information without judgment. Offline is a normal state, not an error.
4. **Native feel.** Safe areas, back gestures and haptics where available. Never at the cost of one consistent identity.

## Principles

1. **Numbers first, always with context.** Write `889 / 2,100 kcal`, not `889 kcal`. A value without its target or unit is incomplete.
2. **The result is the confirmation.** After a save, show the outcome, not a message about it (see Feedback).
3. **Judge only what is certain.** A day in progress can only be over a limit or have met a minimum. Under-target is judged once the day is finished.
4. **Color never works alone.** Every status has an icon or a word as well as a color.
5. **One-handed by default.** Primary actions sit in reach, and every control has a 44px hit area.
6. **Local-first is invisible.** Don't show sync, offline or loading chrome unless the user can act on it.
7. **Expressive, never manipulative.** Motion and delight are welcome. Streaks, shame and urgency are not.

## Never

These are rejected in review.

- Streaks, "you missed a day" nudges, or any guilt mechanic.
- Red for going over a calorie or macro target. Red means error or destructive, nothing else.
- Blocking dialogs for non-critical information. Dialogs are for destructive or irreversible confirmations only.
- A swipe or long-press as the only way to do something. Gestures are shortcuts; a visible control must exist too.
- Status shown by color alone.
- Hardcoded user-visible strings (see Copy).
- A tap target under 44px.

## Voice and copy

- **App UI: plain and precise.** Short, literal, active. `310 kcal over`. `Couldn't save. Try again.` No exclamation marks, no emoji, no "oops".
- **Chat assistant: warmer.** Conversational and friendly, still brief ("Hey there!" is fine). It never scolds or praises weight outcomes.
- Name things the way the user would: "calorie goal", not "macro target record".
- Errors say what happened and what to do next. No apology, no blame.
- Buttons say exactly what they do: `Log`, `Save`, `Cancel`, never `OK`.
- Every string goes through Paraglide with keys in `messages/en.json` and `messages/es.json`.
- Format: `kcal` and `g` after a space, thousands separators, `tabular-nums` wherever digits line up. kcal and gram values in lists are whole numbers; editors may show one decimal.
- Macro order and letters are **C F P** (carbs, fat, protein) in summaries, with the identity colors below.

## Surfaces

Pick the surface by the job, not by what is easiest to build.

| Job                                             | Surface                            |
| ----------------------------------------------- | ---------------------------------- |
| A task with inputs or several steps             | **Page** (a route; back works)     |
| Quick secondary content or actions, status      | **Bottom drawer**                  |
| Confirming a destructive or irreversible action | **Dialog**                         |
| A short list of actions, or a hint              | **Dropdown menu / tooltip**        |
| Results of a user action that can fail          | Inline message, then toast if gone |

Rules:

- **Popovers are not a surface for content.** Anything with more than a line or two of text, or any action, is a drawer.
- Don't stack overlays. A drawer never opens a dialog over itself except to confirm a destructive action.
- Drawers have a visible close control and respond to the system back gesture.
- Sheets for editing use a page when the form is more than a few fields.

## Touch targets

Every interactive element has a **hit area of at least 44×44px**. The drawn size is free: a 32px icon may sit inside a 44px target. This keeps the dense, data-first look while staying one-handed.

- Neighbouring hit areas must not overlap. If two controls are closer than their hit areas allow, increase the gap, don't shrink the target.
- Full-width rows count: the row height is the target height.

Proposed utility (add to `layout.css` and apply in the `button` variants for `icon-xs`, `icon-sm`, `icon` and `icon-lg`):

```css
@utility tap {
	position: relative;
	&::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: max(100%, 44px);
		height: max(100%, 44px);
		transform: translate(-50%, -50%);
	}
}
```

## Color

All colors come from the tokens in `apps/frontend/src/routes/layout.css`. Don't introduce literal colors in components.

### Identity colors (what a thing is)

Fixed meanings, never reused for status:

| Macro                         | Token                                    |
| ----------------------------- | ---------------------------------------- |
| Carbs                         | `--chart-carbs`                          |
| Fat                           | `--chart-fat`                            |
| Protein                       | `--chart-protein`                        |
| Calories consumed / remaining | `--chart-consumed` / `--chart-remaining` |

A macro bar or letter always keeps its identity color. Status never recolors it; status appears as an icon and word next to it.

### Status colors (how it went)

There are two nutrition statuses and no red:

| Status     | Color           | Icon                | Words                                   |
| ---------- | --------------- | ------------------- | --------------------------------------- |
| On target  | success (green) | `✓`                 | On target                               |
| Off target | warning (amber) | `▲` over, `▼` under | A bit over / Over / A bit under / Under |

- Severity is carried by the **word and icon**, not by escalating to red.
- Text uses the darker **ink** tokens, fills use the brighter tokens. Today's `--warning` as small text on white is roughly 2.5:1, below the 4.5:1 minimum, so add `--success-ink` and `--warning-ink` and use them for text.
- Starting values, to confirm in implementation: success `oklch(0.62 0.16 152)` fill, `oklch(0.45 0.12 152)` ink; warning ink `oklch(0.5 0.12 65)` light, `oklch(0.82 0.14 75)` dark.
- Red (`--destructive`) is for errors and destructive actions only.

### When status applies

- **Today (in progress)** shows only certain facts: a ceiling already passed (amber `▲`), or a floor already met (green `✓`). Everything else stays neutral. Being under at 1 pm is normal.
- **Past days (finished)** are judged: on target, or off target with direction.
- The Diary calorie bar shows a tick at the goal once you pass it; the excess segment is amber.

### Judging a finished day depends on the goal

Direction comes from `weeklyCaloricChange` on the macro targets: negative is a cut, about zero is maintain, positive is a bulk. Starting bands for calories as a share of the target, to tune with real use:

| Goal     | On target   | Off target              |
| -------- | ----------- | ----------------------- |
| Cut      | up to 102%  | under 80%, or over 102% |
| Maintain | within ±7%  | outside ±7%             |
| Bulk     | 95% to 115% | under 95%, or over 115% |

Protein is a floor: on target at 95% or more. Carbs and fat are bands: on target within ±10%. Nutrient limits are either ceilings (sodium, added sugar, saturated fat) or floors (fibre), and each knows which.

## Typography and numbers

- Font: Inter (already installed). Don't add display faces.
- Numbers that line up use `tabular-nums`.
- Secondary text uses `--muted-foreground`; it is for supporting text, never for the main reply or the only place a status appears.
- Chat assistant replies use normal text color. Reasoning is muted and collapsed.

## Layout, density and shape

- Page gutter is 16px; content is capped at `max-w-xl` and centered. Use the Tailwind spacing scale with `gap-*`, not per-element margins.
- Lists and rows are dense but 44px or taller wherever they are tappable.
- Components come from the shadcn-svelte **vega** style (preset `bIkeymG`: neutral base, Inter, Lucide), with `--radius: 0.5rem` in `layout.css`. Reuse its shapes; don't introduce new radii or shadows. The brand blue (`--primary`) and the status tokens are ours and stay when the preset is re-applied.

### Customised shadcn components

Re-adding or reinstalling a component with the CLI overwrites these edits, so re-apply them (or add the component with `-o` into a scratch project and merge by hand):

- **44px hit areas:** `button` (base gets `relative tap`), `input` and `input-group` (`h-11`), `input-otp-slot` (`size-11`), `select-trigger` (`h-11`, `tap`), `dropdown-menu-item` and `select-item` (`min-h-11`), `switch` and `radio-group-item` (larger `after:` inset), `toggle` (`h-11`), `sidebar-menu-button` and `sidebar-menu-sub-button` (`h-11`), `breadcrumb-link` (`tap`).
- **`dialog-content`:** a `closeLabel` prop, so the close button's label can be translated.
- **`empty-media`:** the icon tile is `rounded-xl`.
- **Toast buttons:** `layout.css` gives sonner's action buttons the same hit area.
- Chat message rows use `content-visibility: auto`, which clips anything hanging outside the row, so controls inside them need real 44px height, not `tap`.
- Safe-area insets are always respected. Never override `viewport-fit=cover`.

## Motion

Expressive, but purposeful. Motion explains cause and effect, rewards completion, and never delays input.

| Use                             | Duration     | Notes                                          |
| ------------------------------- | ------------ | ---------------------------------------------- |
| Press, hover, toggles           | 100–150 ms   | Ease-out                                       |
| Sheets, drawers, route changes  | 200–300 ms   | Spring or ease-out; interruptible              |
| Charts and number changes       | 250–400 ms   | Tween values; don't re-animate on every render |
| Reward moments (daily goal met) | up to 600 ms | At most once per day; ignorable, never blocks  |

- Respect `prefers-reduced-motion`: replace movement with an instant change or a fade.
- Rewards celebrate the day, not a streak. No countdowns, no loss framing.
- Don't animate layout for long lists; animate only the item that changed.

## Feedback

- **Inline confirmation by default.** After a create or edit, land on the result and highlight the changed row briefly, scrolled into view. When the user stays on the page (a goals form), the save button changes to `Saved ✓` for about two seconds.
- **Toasts are for what can't be shown in place:** errors, undo after a destructive action, and system events (update ready, session expired).
- **Delete shows an Undo toast.** Deleting is quiet but reversible.
- Optimistic by default: writes are local and instant, so never show a spinner for them.
- Haptics are an enhancement where the plugin exists (see Capacitor in `AGENTS.md`); never the only signal.

How it is built: the mutation's `onSuccess` records the changed id in one small shared store; the list reads it, scrolls to the row and plays a CSS highlight. Save buttons read the mutation's `isSuccess` and reset on a timer. Toasts remain only for the cases above.

## System state

- A **persistent quiet indicator** in the header shows sync state (cloud icon). It never uses banners or toasts for routine states.
- Tapping it opens a **drawer** with status, last sync time, any error and the one action available.
- Surface only what is actionable: signed out, repeated sync failures, a conflict. Offline and syncing are neutral.
- Edits keep saving locally in every state; say so when sync is paused.

## Accessibility

- Text contrast 4.5:1, large text and UI components 3:1.
- Never convey meaning by color alone; status has an icon or word.
- Visible focus ring on every interactive element.
- Support dynamic text size without clipping; let text wrap, never truncate numbers.
- Labels on every icon-only control.

## Chat

- The chat is the same product, not a skin. It follows every rule above except voice (warmer).
- A tool action needing a decision (confirm a food entry, answer a clarification) is a card inside the conversation, not a modal.
- A stale pending card becomes `Skipped` when the user moves on.
- While a card streams in, show a spinner and a short label, not a skeleton.

## Reviewing a screen

Run `pnpm --filter @myfit/frontend screenshots` to see every screen in light and dark after a change (see the frontend README). Before merging UI, check:

- [ ] Every tappable thing has a 44px hit area; nothing overlaps.
- [ ] Surface matches the job (page, drawer, dialog, menu).
- [ ] Numbers carry their unit and target; digits are tabular.
- [ ] Status has an icon or word, uses ink for text, and never uses red for nutrition.
- [ ] In-progress days are not judged.
- [ ] Confirmation is inline; toasts only for errors, undo and system events.
- [ ] All strings come from Paraglide in both languages.
- [ ] Reduced motion and dark mode both look right.
- [ ] Works one-handed, offline, and with the keyboard open.

## Where the app differs today

Applied on 2026-10-30. What changed, and what is still open.

**Done**

- 44px hit areas: the `tap` utility is on every `Button` size, breadcrumb links, select triggers and the chat disclosure. Inputs, input groups, OTP slots, menu rows, toggles and sidebar rows are 44px tall. Switch and radio hit areas are 44px. Empty meal and activity rows are 44px or taller.
- The sync panel is a bottom drawer with a 44px trigger and a visible Close button. Offline is shown as a neutral note, not an alarm.
- The drawer content was positioned off screen on mobile (`fixed relative` in `drawer-content.svelte`). Fixed, which also repairs the account dialogs on phones.
- Status colors: `--success`, `--success-ink` and `--warning-ink` exist. The calorie bar uses ink for text, an arrow when off target, a tick at the goal once passed, and a status chip for finished days. The rules live in `lib/domain/nutrition/status.ts` with tests.
- Feedback: creating or editing an entry marks it (`recent-change.svelte.ts`) and the diary highlights and scrolls to it; the goals screen shows `Saved` on the card you just changed. Deleting an entry shows an Undo toast that restores it. Success toasts are gone.
- Paraglide: toast, chat, scan, search, targets, breadcrumb and macro-name strings. Calorie numbers have thousands separators.
- Reduced motion is respected globally; spinners keep moving.
- The goals list no longer nests a button inside a link, and the calorie bar no longer nests a link inside a link.

**Still open**

1. The nutrition editor (`modify-nutritional-info-sheet.svelte`) is a sheet with many fields. The rule says a page. Moving it means lifting the parent form's state, so it is left for now.
2. Strings are still hardcoded in the recipes stub, the activity preferences screen and the health-data panel. They are unfinished screens, which `AGENTS.md` allows, but they should be converted when finished.
3. The Week and Nutrients views from the status section do not exist yet.
4. A "daily goal met" reward moment is allowed by the motion rules but not built.
5. Touch targets were measured in a mobile-width browser. Check on a real device, especially the header.

## Open questions

- **Haptics:** which actions get one (log, delete, goal met)? Not decided.
- **Red for far-off finished days:** the mocks used red for "far off" and this file removes it, since you rejected red for going over. If protein far below the floor should read stronger than amber, say so; the default is amber with a stronger word.
- **Defining "finished":** this file says past days. If a "close the day" action is wanted, it changes that rule.
- **Units:** metric only for now. Imperial would change the number format rules.
