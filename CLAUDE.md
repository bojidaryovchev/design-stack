# Project

This repository **is** the `design-stack` Claude Code plugin. It is not an application, and it
is not meant to be copied into other projects. Consumers install it as a plugin:

```
/plugin marketplace add bojidaryovchev/design-stack
/plugin install design-stack@design-stack
```

Everything then resolves from the plugin root through `${CLAUDE_PLUGIN_ROOT}`: skills, the four
impeccable agents, and the three hooks. Nothing is written into the consuming project except the
design artifacts impeccable produces there on purpose (`PRODUCT.md`, `DESIGN.md`, `.impeccable/`).

## Where the behaviour lives

**The working agreement and the precedence rulings are in
`.claude/skills/design-arbiter/SKILL.md`, not here.** They used to live in this file, which meant
they only applied inside this repo. A plugin cannot ship a `CLAUDE.md`, so they moved into the
skill (loaded on demand) plus a compact card injected by `hooks/session-start.mjs` on every
session, which is what makes the chain fire without the user naming a command.

Do not restate those rulings in this file. One copy, in the skill, is the point.

## Layout

```
.claude-plugin/       marketplace.json + plugin.json. The distribution manifest
.claude/skills/       impeccable (Apache-2.0), emil's four (MIT), design-arbiter (original)
agents/               impeccable's four subagents, vendored from its plugin distribution
hooks/                hooks.json (SessionStart, PostToolUse, Stop) + session-start.mjs
scripts/preflight.mjs detector tier availability check
package.json          the detector's runtime dependencies
.design-sources/      gitignored. The four upstream repos, for re-verifying the rulings
```

`.claude/skills/` is deliberately kept at that path rather than moved to `skills/` so
`npx impeccable update` and `npx skills update` keep working against it.

## Maintenance rules

- **Never edit anything under `.claude/skills/impeccable/` or
  `.claude/skills/emil-design-eng/`** (or `review-animations`, `improve-animations`,
  `animation-vocabulary`). All are vendored unmodified and updatable. Overrides belong in
  `design-arbiter/`.
- **`agents/` is vendored too.** Refresh it from impeccable's `plugin/agents/` on update. The
  file-copy CLI install does not ship these; only the plugin distribution does.
- **Run `npm install` after cloning.** Without it the static-HTML detector tier fails open: it
  catches the import error, falls back to regex, and reports zero findings with exit 0. Verify
  with `npm run preflight`, which is also what the SessionStart hook warns on.
- **The rulings quote upstream text.** After an impeccable or emil version bump, re-read
  `craft-floor.md`, `animate.md`, `operate.md`, and `new-work.md` against rulings 1 through 4
  and 9 through 10, and re-check the detector rule count in
  `scripts/detector/registry/antipatterns.mjs` against the three places the arbiter cites it.
- **Cite the installed release, not the clone.** `.design-sources/pbakaus-impeccable` tracks
  main, which runs ahead of the published version vendored here. Ruling 10 carries a version
  note for exactly this reason.
- **Never run `npx impeccable install --providers=<other>` in this repo.** It writes a full
  duplicate of the skill tree into a per-provider directory plus a generated context file that
  restates the rulings. Both go stale immediately. Those paths are gitignored; `AGENTS.md` is a
  thin pointer and must stay one.
- **Zero em dashes (U+2014) and zero en dashes (U+2013)** in this repo's own markdown, per
  ruling 6. Grep by codepoint, never by pasting the glyph.
