# Accounts and sessions

The device holds one local account at a time. Before any page reads data, the app must decide which account that is, and some of those decisions need the user (another account's unsynced data, a failed open, a logout). This page explains how the app makes that decision without a page ever showing the wrong account's data.

## Why the account root lives outside the router

SvelteKit renders a page only after its `load`s finish, and every `load` waits for the account. So the dialogs that decide the account can't live inside a page: they would never render. The account root (`#lib/components/account/account-root.svelte`) is mounted on `document.body` instead, outside the router's tree. It also owns the theme (`ModeWatcher`) and the toasts (`Toaster`).

## The flow

1. The root `+layout.svelte` wraps the tree in `<QueryClientProvider>`.
2. `hooks.client.ts` `init` claims the single-tab lock (`claimTab` in `#lib/services/account/account-session.svelte.ts`) and mounts the account root, before the first `load`.
3. The account root keeps one local account. It checks the local database against the better-auth session, asks before replacing another account's unsynced data, starts the sync worker for a signed-in account, and publishes the result with `publishOwner`. An expired session keeps the stored account working offline.
4. `(app)/+layout.ts` waits with `accountReady(depends)`. It settles with the account (a user id, or `null` for none) and never while a dialog is waiting, so a navigation waits behind the dialog. It returns the `ownerId` and the local user, which `getCurrentUser()` reads. When the account changes, `publishOwner` reruns the `load`s that read the old one.
5. `(app)/(protected)/+layout.ts` redirects to `/login?redirect=…` when there is no account, and returns `ownerId: string`. Only pages that read no user data live outside this group, in `(app)`: the legal pages and the docs. Keeping the docs there means a shared link to a docs section (`#…`) works signed out: the redirect can't keep a hash, because SvelteKit doesn't let a `load` read `url.hash`.
6. `(app)/+layout.svelte` renders pages only while `data.ownerId` is the account on screen, so a switch never leaves the other account's data in the DOM.

## Logging out

`logout()` in `#lib/services/account/logout.ts` saves queued edits, signs out, and then deletes the local database. If a step fails, it keeps the account and offers retry, cancel or discard.

After a sign-in or sign-out, wait for the session store with `settleSession()` before navigating. The store lags behind the request, and the account is ready only once the store has caught up.
