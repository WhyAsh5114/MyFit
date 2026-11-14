# Skills

Project skills for Claude Code. `.agents/skills` links here, so other agents read the same set.

| Skill                           | Invoked by | Use it to                                                                   |
| ------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `grill-me`                      | you        | stress-test a plan or design before any code is written                     |
| `improve-codebase-architecture` | you        | find shallow modules worth deepening, as an HTML report, then grill one     |
| `grilling`                      | model      | the interview loop behind `grill-me` and the architecture review            |
| `codebase-design`               | model      | the deep-module vocabulary (module, interface, seam, depth) for design work |
| `domain-modeling`               | model      | sharpen terms in `GLOSSARY.md` and record ADRs in `docs/adr/`               |
| `writing-for-agents`            | model      | write or edit a skill, `CLAUDE.md`, or any doc an agent reads               |

## Vendored skills

All of them are copied from [mattpocock/skills](https://github.com/mattpocock/skills) at commit `5863806` (MIT, see `LICENSE-mattpocock-skills`). They are copies, not a plugin, so the set stays small and we can edit them. To update one, copy the newer files over it and review the diff.

Add a skill only for a task that recurs. Rules that every task needs belong in `CLAUDE.md`, rules for one area of the code in `.claude/rules/`; facts belong in `docs/`, and a skill links to them instead of copying them.
