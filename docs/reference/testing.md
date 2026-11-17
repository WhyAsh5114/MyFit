# Testing

Which test to write for which code, and what makes it worth keeping. The principles come from [_Software Engineering at Google_](https://abseil.io/resources/swe-book), chapters 11–14 (Testing Overview, Unit Testing, Test Doubles, Larger Testing). We chose it because its rules are concrete enough to check in review, and its order of preference for test doubles (real, then fake, then stub, then mock) is exactly what a local-first app with a fake IndexedDB needs.

How to run each suite is in [Run the tests](../how-to/run-tests.md).

## What a test is for

A test exists to catch a behavior change someone would care about, and to keep passing through refactors that don't change behavior. A test that breaks on every refactor, or can never fail, costs more than it gives. Before writing one, name the bug it would catch.

## Which layer

Pick the smallest layer that can see the behavior. Most of the suite is the first three rows.

| Code                                                                         | Test                                                                     | Tool                            | Example                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------- |
| Pure logic in `lib/domain/`, key factories, parsers                          | Unit, exhaustive: every branch and boundary                              | Vitest                          | `tests/lib/domain/nutrition/status.test.ts`                    |
| Readers, mutations, transactions, chat tool handlers                         | Against a real IDB client on `fake-indexeddb`, a fresh database per test | Vitest + `fake-indexeddb/auto`  | `tests/lib/features/assistant/tools/read-food-entries.test.ts` |
| Services with timing or ordering (tab lock, sync invalidation, dependencies) | Through their public functions, with real collaborators                  | Vitest                          | `tests/lib/services/account/account-session.test.ts`           |
| API routes and server logic                                                  | Through the Hono app against a migrated Postgres test database           | Vitest + `TEST_DATABASE_URL`    | `apps/api/tests/features/sync/routes.test.ts`                  |
| A user flow across pages, the account, sync or offline                       | End to end against the built app, the real API and Postgres              | Playwright                      | `tests/e2e/diary-data.spec.ts`                                 |
| How a screen looks, and 44px tap targets                                     | Screenshot canvas, reviewed by a person; tap targets are asserted        | Playwright (`pnpm screenshots`) | `tests/screenshots/screens.spec.ts`                            |

Invariants that span files get a unit test too: `tests/messages.test.ts` checks that every language has the English keys and parameters, and `sync-invalidation.test.ts` checks that every synced model has keys.

Svelte components have no unit tests. If a component holds logic worth testing, move that logic into `lib/domain/` or the feature and test it there; the component is covered by e2e and screenshots.

## When to write one

- **A bug fix** starts with a test that fails on the bug, at the smallest layer that reproduces it.
- **New domain logic** gets unit tests for every branch, boundary and unit conversion.
- **A mutation or reader with logic** (ordering, upserts, soft deletes, day bounds) gets a fake-indexeddb test. A plain `create` with no logic doesn't need one.
- **A new user flow** gets one e2e test for the main path and one for the riskiest branch (offline, another account, a failed save).
- **A new screen** gets a `shot(...)` in the screenshot spec.

Don't test generated code (`components/ui`, Paraglide, Prisma output), the framework itself, constants, or mappers that only rename fields.

## What makes it a good test

**Test behavior through the public interface.**
Call what callers call, and assert what callers see. For a mutation, write through the mutation and read back through the reader, not through private helpers. A test that has to reach past the interface means the module is the wrong shape.

**One behavior per test, named for it.**
Name the test after the behavior and its condition: `it('keeps the entry on its day when the timezone changes')`, not `it('works')` or `it('calls saveMeals')`. A test can have several assertions if they check one behavior.

**Assert on state, not on interactions.**
Check the resulting data or output, not that a function was called with certain arguments. Interaction checks break when the implementation changes and pass when the result is wrong.

**Prefer real implementations, then fakes, then mocks.**
Use the real code where it is fast and deterministic. Use a fake where it isn't: `fake-indexeddb` for IndexedDB, the in-memory sync database stand-in, the mail stub. Mock only what you don't own and can't fake: the LLM (canned stream through `page.route`), Exa, the sign-in check when sign-in isn't under test, and SvelteKit's runtime modules (`$app/navigation`, `$app/state`), which need a running app (`account-session.test.ts` mocks `invalidate`). Never mock the module under test or our own data layer: for code that calls `getDb()`, start each test with `freshDb(userId)` from `tests/lib/support/local-db.ts`, which gives the real client an empty fake-indexeddb database.

**Make expected values independent.**
Write the expected value as a literal from a worked example, the spec or `DESIGN.md`. An expectation computed the way the code computes it passes by construction.

**No logic in tests.**
No loops, conditions or string building in a test body. Repeat a little setup if it makes the test readable top to bottom (DAMP over DRY). Shared helpers build data (`seed`, `openDb`); they don't hide assertions. Use `it.each` for a table of cases.

**Each test starts from a known state.**
A fresh database per test (unique `dbName`, or a unique Postgres schema or user that cleanup removes). Tests never depend on order or on each other.

**Deterministic and fast.**
No `sleep` (`waitForTimeout`). In Playwright, wait with web-first assertions (`await expect(locator).toBeVisible()`), or `expect.poll` for something the page doesn't show. Before a screenshot, call `settle(page)` from `tests/e2e/support/settle.ts`, which waits for fonts and animations to finish. To check that something did _not_ happen, first wait for whatever would cause it (a response, a navigation), then assert it's absent; when nothing observable marks the cause, a short bounded wait with a comment is the one allowed exception (the preload check in `account-flow.spec.ts`). Fix the clock or the date when the behavior depends on it, and use dates in the local day, not UTC (`toLocaleDateString('en-CA')`). The e2e suite runs in `America/New_York`, and the test runner shares that zone (`playwright.config.ts`), so a spec's `new Date()` gives the browser's day.

**A failure explains itself.**
The test name plus the assertion message should tell a reader what broke without opening the code.

## Changing tests

- A refactor that changes no behavior should change no tests. If tests must change, they were testing the implementation; fix them to test behavior.
- When a module is deepened and tests exist at its new interface, delete the old tests on the shallow parts.
- Never weaken or delete a failing test to make a change pass. Either the code is wrong or the behavior changed on purpose; say which.
