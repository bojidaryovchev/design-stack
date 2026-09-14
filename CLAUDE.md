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
`skills/design-arbiter/SKILL.md`, not here.** They used to live in this file, which meant
they only applied inside this repo. A plugin cannot ship a `CLAUDE.md`, so they moved into the
skill (loaded on demand) plus a compact card injected by `hooks/session-start.mjs` on every
session, which is what makes the chain fire without the user naming a command.

Do not restate those rulings in this file. One copy, in the skill, is the point.

## Layout

```
.claude-plugin/       marketplace.json + plugin.json. The distribution manifest
skills/               impeccable (Apache-2.0), emil's four (MIT), design-arbiter (original)
agents/               impeccable's four subagents, vendored from its plugin distribution
hooks/                hooks.json (SessionStart, PostToolUse, Stop) + session-start.mjs
scripts/preflight.mjs detector tier availability check
package.json          the detector's runtime dependencies
.design-sources/      gitignored. The four upstream repos, for re-verifying the rulings
```

**These paths are load-bearing, not preference.** Claude Code discovers plugin components by
convention from the plugin root: `skills/<name>/SKILL.md`, `agents/*.md`, `hooks/hooks.json`.
There is no supported way to point at skills somewhere else, so a layout like `.claude/skills/`
loads nothing. Do not move these directories.

**Declare no component paths in `plugin.json`.** Anthropic's `plugin-dev` skill says custom
paths "supplement defaults, they don't replace them". That is not what happens: an explicit
`"agents": [...]` array suppressed discovery entirely and the plugin loaded **zero** agents,
even with the files sitting at the conventional path and every listed path resolving. Deleting
the key loaded all four. None of the 39 plugins in the official marketplace declares a component
path key. Keep the manifest to metadata only.

**Verify with the real tool, not a hand-rolled one.** `claude plugin validate .` checks the
manifests, and `claude plugin details design-stack` prints the component inventory and the
token cost. Both findings above came from that inventory after a homemade validator passed:
it confirmed the paths existed on disk, which is not the same question as whether the loader
reads them. Check the inventory after any change to the manifest or the directory layout.

## Maintenance rules

- **Never edit anything under `skills/impeccable/` or
  `skills/emil-design-eng/`** (or `review-animations`, `improve-animations`,
  `animation-vocabulary`). All are vendored unmodified and updatable. Overrides belong in
  `design-arbiter/`.
- **`agents/` is vendored too.** Refresh it from impeccable's `plugin/agents/` on update. The
  file-copy CLI install does not ship these; only the plugin distribution does.
- **There are no npm dependencies.** Since impeccable 4.3.0 the detector, hook, context loader
  and live server are one Rust binary, fetched and checksum-verified by
  `skills/impeccable/scripts/impeccable` on first use. Run `npm run preflight` after cloning to
  confirm the engine answers its handshake; that is also what the SessionStart hook reports on.
  Do not reintroduce a `dependencies` block without a concrete reason.
- **The rulings quote upstream text, and upstream moves weekly.** Before trusting any ruling,
  `git -C .design-sources/<repo> fetch` and check the date; a stale clone is how this project
  once spent a whole session reasoning about a version that had been superseded for seven weeks.
  After a version bump, re-read `craft-floor.md`, `animate.md`, `operate.md`, and `new-work.md`
  against rulings 1 through 4 and 9 through 10, and re-check the rule count in
  `crates/foundation/src/registry.rs` against the four places the arbiter cites it.
- **Cite the installed release, not the clone.** `.design-sources/pbakaus-impeccable` tracks
  main, which can run ahead of what is vendored here. Ruling 10 carries a version note for
  exactly this reason.
- **Never run `npx impeccable install --providers=<other>` in this repo.** It writes a full
  duplicate of the skill tree into a per-provider directory plus a generated context file that
  restates the rulings. Both go stale immediately. Those paths are gitignored; `AGENTS.md` is a
  thin pointer and must stay one.
- **Zero em dashes (U+2014) and zero en dashes (U+2013)** in this repo's own markdown, per
  ruling 6. Grep by codepoint, never by pasting the glyph.
