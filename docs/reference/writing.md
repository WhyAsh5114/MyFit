# Writing docs

Rules for every doc in this repo: `CLAUDE.md` (also read as `AGENTS.md`), `DESIGN.md`, `GLOSSARY.md`, `docs/`, READMEs, skills and code comments. They come from [Diátaxis](https://diataxis.fr/) (what kind of page) and [Google's technical writing course](https://developers.google.com/tech-writing) (how to write it). Agents and people read the same docs, so write for a capable reader who is new to this code.

## Put the fact in one place

- **Each fact has one home.** Before writing, search for it. If it exists, link to it or move it; never copy it. A skill, `CLAUDE.md` and a README link to docs; they don't restate them.
- **Don't restate the environment.** Commands are in `package.json`, versions in lockfiles, layout in the tree. Write what the code can't tell you: the convention, the reason, the gotcha.
- **Prefer a lint rule to a sentence.** If a rule can be checked mechanically, add it to `eslint.config.js` with a message that explains the reason, and leave the doc to say why.

## Pick the type, then the place

| You are writing…                                | Type        | Place                                  |
| ----------------------------------------------- | ----------- | -------------------------------------- |
| Steps to finish a task                          | How-to      | `docs/how-to/<verb>-<thing>.md`        |
| Rules, names, tables someone looks up           | Reference   | `docs/reference/`, `DESIGN.md`         |
| Why something is built the way it is            | Explanation | `docs/explanation/`                    |
| A hard-to-reverse choice with real alternatives | Decision    | `docs/adr/NNNN-<slug>.md`              |
| What a product term means                       | Glossary    | `GLOSSARY.md`                          |
| A rule every agent needs on every task          | Router      | `CLAUDE.md` (keep it under ~120 lines) |
| Why one piece of code is unusual                | Comment     | next to the code                       |

Keep one type per page. A how-to that stops to explain history becomes hard to follow; link to the explanation instead. When a page starts to hold two types, split it.

An ADR follows `.claude/skills/domain-modeling/ADR-FORMAT.md`: a few sentences on context, decision and reason. Write one only when the choice is hard to reverse, surprising without context and the result of a real trade-off.

## Write it plainly

- **Short sentences, one idea each.** Aim for under 25 words.
- **Active voice, present tense.** "The sync worker pushes the outbox", not "The outbox is pushed".
- **Lead with what matters.** The first sentence of a page or section says what it is for. Put conditions before instructions: "To add a model, run…".
- **Use one term for one thing.** Use the words in `GLOSSARY.md` and in the code. Don't vary words for style.
- **Be specific.** Name the file, function, command or number. Use `file.ts` paths and backticks for code.
- **Lists for parallel items, numbered lists for steps, tables for comparisons.** A list of two is a sentence.
- **Cut what changes nothing.** Delete a sentence that says what the reader already knows or does by default: introductions, summaries of what's next, "note that", "simply", "it's important to".
- **Say what to do, not only what to avoid.** Pair every "don't" with the thing to do instead.

## Keep it true

- Update the doc in the same change as the code it describes. A stale doc is worse than none.
- Delete what no longer applies. Don't leave history in a reference page; that goes in git or an ADR.
- Code comments say why, not what. Write them as full sentences.
