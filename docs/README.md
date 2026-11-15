# MyFit documentation

For people and agents working on MyFit. Each page is one [Diátaxis](https://diataxis.fr/) type, so you know what kind of page you are reading and where a new fact belongs.

| Type            | Answers                       | Where                                       |
| --------------- | ----------------------------- | ------------------------------------------- |
| **Explanation** | Why is it built this way?     | `explanation/`                              |
| **Reference**   | What are the rules and names? | `reference/`, `DESIGN.md`, `GLOSSARY.md`    |
| **How-to**      | How do I do this task?        | `how-to/`                                   |
| **Decisions**   | Why did we choose X over Y?   | `adr/` (none yet; the first ADR creates it) |

There are no tutorials yet. Add one when someone new needs a guided first change.

## Explanation

- [Local-first data](explanation/local-first.md): why user data lives in IndexedDB, and how it reaches the server.
- [Accounts and sessions](explanation/accounts.md): how the app decides whose data is on screen.
- [Updates and version drift](explanation/updates.md): web, OTA and store updates, and the sync contract.
- [Chat](explanation/chat.md): where each chat tool runs, and how chats are saved.

## Reference

- [Architecture](reference/architecture.md): where code goes, how it splits, and the patterns to repeat.
- [Data layer](reference/data-layer.md): readers, loads, mutations, query keys and naming.
- [Frontend conventions](reference/frontend.md): Svelte 5, forms, components, i18n and Capacitor.
- [Testing](reference/testing.md): which test to write for which code, and what makes it a good test.
- [Writing docs](reference/writing.md): how to write and where to put a doc.
- [Agent setup](reference/agent-setup.md): how agents get these conventions: `CLAUDE.md`, path rules, hooks, lint and skills.
- [`DESIGN.md`](../DESIGN.md): how the app looks and behaves.
- [`GLOSSARY.md`](../GLOSSARY.md): the product's terms.

## How-to

- [Add a feature](how-to/add-a-feature.md)
- [Change the database schema](how-to/change-the-schema.md)
- [Run the tests and screenshots](how-to/run-tests.md)
- [Release the app](how-to/release.md)
- API: [run the API tests](../apps/api/docs/testing.md), [load nutrition data](../apps/api/docs/seeding-nutrition-data.md)
