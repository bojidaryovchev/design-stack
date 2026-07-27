# design-stack

Three of the best open-source design skills for AI coding agents, layered so they cooperate
instead of cancelling each other out, plus an arbitration layer that resolves the twelve points
where they contradict.

## The problem this solves

[impeccable](https://github.com/pbakaus/impeccable), [emilkowalski/skills](https://github.com/emilkowalski/skills),
and [taste-skill](https://github.com/Leonxlnx/taste-skill) are all good. Installed together they
fight, and impeccable's own docs say why:

> Two skills with different design vocabularies collide and cancel each other out.

That warning is aimed at Anthropic's `frontend-design` skill, but it applies to any second
base-layer design skill. The naive fixes both lose:

- **Install one, ignore the rest.** You lose emil's component-level motion specs, which nothing
  else has, and taste-skill's countable composition rules, which nothing else has either.
- **Merge them into one skill.** You lose impeccable's 65 deterministic detector rules, its edit
  hooks, live mode, and CLI, because none of that survives translation into markdown.

This repo does neither. It keeps impeccable and emil installed **unmodified** from upstream, and
adds a thin arbitration layer that routes between them and rules on the collisions.

## What is here

```
CLAUDE.md                          precedence rulings, always in context (~900 tokens)
NOTICE                             Apache-2.0 + MIT attribution for all three sources
skills-lock.json                   emil skills pinned by content hash
.claude/
  settings.json                    detector hooks: PostToolUse on every edit, Stop deep pass
  skills/impeccable/               upstream, unmodified. npx impeccable update
  skills/emil-design-eng/          upstream, unmodified. npx skills update
  skills/review-animations/        upstream. user-invocable only
  skills/improve-animations/       upstream
  skills/animation-vocabulary/     upstream
  skills/design-arbiter/           THE ONLY ORIGINAL WORK HERE
    SKILL.md                       routing table, surface modes, detector tiers
    reference/conflicts.md         12 rulings, each citing the conflicting text
    reference/marketing-rules.md   taste-skill's countable rules, harvested
.design-sources/                   gitignored. the four upstream repos, for re-verification
```

## How the layering works

| Layer | Source | Owns |
|---|---|---|
| Base | impeccable | Vocabulary, process, art direction, **enforcement** |
| Specialist | emil-design-eng | Motion mechanics and component interaction specs |
| Harvested | taste-skill | Countable composition rules for marketing surfaces |
| Arbiter | this repo | Routing and conflict resolution. **No aesthetic opinions of its own** |

impeccable is the base because it is the only source with deterministic enforcement. Its rules
fire whether or not the model was paying attention to any prose. The other two are prose, and
prose only works under attention.

taste-skill is **not installed**. Its `SKILL.md` is a single 87 KB file (~24k tokens) with no
progressive disclosure, roughly 8x impeccable's resting cost, and its trigger description is
broad enough to fire on work it explicitly excludes (*"Not dashboards, not data tables, not
multi-step product UI"*). Its genuinely valuable contribution, the countable composition rules,
is harvested into `marketing-rules.md`, which costs nothing at rest and loads only for the
surfaces it applies to.

The arbiter carries no design taste of its own. That constraint is stated in the skill itself,
because a fourth opinionated vocabulary is exactly the problem this exists to solve.

## The twelve rulings

Each cites the conflicting passage in `reference/conflicts.md` so it is auditable, not arbitrary.

| # | Conflict | Ruling |
|---|---|---|
| 1 | Motion volume | impeccable. One authored moment per surface, not a per-section reveal floor |
| 2 | Motion mechanics | emil. `:active` scale, `transform-origin`, never `scale(0)`, GPU rules |
| 3 | Durations | By surface mode. Operate/Read 150-250ms; Persuade/Experience one focal 500-800ms |
| 4 | Easing | One token: `cubic-bezier(0.16, 1, 0.3, 1)`. `ease-in` banned on UI |
| 5 | Stack | impeccable. Inherit the incumbent framework, icons, fonts. Never re-platform |
| 6 | Em dash | Zero in user-visible copy |
| 7 | Review format | emil's Before/After/Why table for motion reviews only |
| 8 | emil's canned first reply | Suppressed |
| 9 | Who writes DESIGN.md | impeccable, at finish. Never `init`, never by hand |
| 10 | Who owns the finish | impeccable on new work; the arbiter's chain is for refinement |
| 11 | Image-first workflow | impeccable's `visualize.md`, not taste-skill's `image-to-code` |
| 12 | DESIGN.md format | Only `/impeccable document` writes it |

## Two things worth knowing before you use it

**There are three finish regimes, not one.** New work uses impeccable's own bounded finish (two
screenshot rounds, then the `impeccable-finish-reviewer` subagent, then the documenter). Ordinary
refinement uses the arbiter's lighter chain. **Live mode uses neither**, because the browser
overlay is the verification channel and inserting an audit mid-cycle stalls the user's picker.
Getting this wrong means running a redundant audit against a flow that explicitly says *"do not
run a second detector."*

**A clean hook result is not a clean bill of health.** The detector engines do not cover the same
rules:

| Tier | Runs on | Catches |
|---|---|---|
| regex | any source file | `side-tab`, `gradient-text`, `overused-font`, `bounce-easing`, `gray-on-color` |
| static-HTML | `.html` with linked CSS | plus `oversized-h1`, `extreme-negative-tracking` |
| browser + visual | **a rendered URL only** | `nested-cards`, `tiny-text`, `low-contrast`, `text-occlusion` |

The edit hook runs the file tiers. Structural and contrast rules cannot fire without a rendered
page. Before shipping a surface, run `/impeccable audit <target>` against a dev server, or scan
the URL directly:

```bash
node .claude/skills/impeccable/scripts/detect.mjs http://localhost:3000
node .claude/skills/impeccable/scripts/detect.mjs http://localhost:3000 --viewport 390x844
```

## Install

Requires Node 22.12+ (impeccable's floor).

```bash
git clone <this-repo> && cd design-stack
```

Or reproduce it from scratch in an existing project:

```bash
npx impeccable install --providers=claude --scope=project
npx skills add emilkowalski/skills \
  -s emil-design-eng -s review-animations -s improve-animations -s animation-vocabulary \
  --agent claude-code --copy -y
# then copy .claude/skills/design-arbiter/ and CLAUDE.md from this repo
```

Move the hook block from `.claude/settings.local.json` into `.claude/settings.json` if you want
teammates to get the enforcement. The installer writes the local file, which is gitignored;
impeccable's `HARNESSES.md` documents `settings.json` as the manifest location and its `hooks.md`
confirms a hook moved there *"is honored in place too."*

## Using it

You should not have to name a command. `CLAUDE.md` carries a working agreement that fires
automatically on any request that creates or changes UI: declare the surface mode, build with
the precedence applied, then run whichever finish regime fits, then report. Escape hatches are
honored: *"quick fix"*, *"skip the design pass"*, or naming a command directly.

The one command worth running deliberately, once per project:

```
/impeccable init
```

It interviews you about audience, positioning, voice, and constraints, then writes `PRODUCT.md`.
Every other command reads it, and without it they fall back to generic SaaS patterns. Note that
`init` writes `PRODUCT.md` **only**. `DESIGN.md` is written at finish, from the built artifact,
by the `impeccable-documenter` subagent. A rulebook written before the build gets defended
against reality instead of describing it.

## Maintaining it

All three upstreams push roughly weekly, and the rulings quote specific passages. `conflicts.md`
cites the exact text for each ruling so drift is visible rather than silent, but after a major
version bump the rulings want re-checking:

```bash
git -C .design-sources/pbakaus-impeccable pull
git -C .design-sources/emilkowalski-skills pull
git -C .design-sources/leonxlnx-taste-skill pull
```

Then re-read `craft-floor.md`, `animate.md`, and `operate.md` against rulings 1 through 4.

`.design-sources/` is gitignored (56 MB of other people's repositories). Re-fetch with:

```bash
mkdir -p .design-sources && cd .design-sources
git clone --depth 1 https://github.com/pbakaus/impeccable pbakaus-impeccable
git clone --depth 1 https://github.com/emilkowalski/skills emilkowalski-skills
git clone --depth 1 https://github.com/Leonxlnx/taste-skill leonxlnx-taste-skill
```

## How this was built

The rulings are not guesses. All three repositories were read end to end, about 17,000 lines:
emil complete at 11/11 files, impeccable complete across 39 reference files plus its agents and
contributor docs, taste-skill complete including all four image skills.

Reading the full text mattered more than expected. A partial read produced four wrong rulings
that a complete read caught:

- **`init` was documented as writing `DESIGN.md`.** It does not, and `init.md` says it must never
  offer to. impeccable's own README is stale on this point; the skill reference is authoritative.
- **The working agreement reinvented impeccable's finish flow**, which already exists, is
  bounded at two rounds, and says *"do not run a second detector."*
- **Operate durations were set at "under 300ms"** when `operate.md` specifies 150-250ms and bans
  page-load choreography outright.
- **The marketing pre-flight was invented rather than harvested.** taste-skill's real one is a
  ~60-item checklist; the first attempt was a thin subset of it.

Two more conflicts only surfaced on the final pass through the files that looked least relevant.
`image-to-code` turned out to emit code rather than images, and collides with impeccable's
`visualize.md` on the approval gate and on trace-versus-north-star. `stitch-design-taste` writes
a `DESIGN.md` whose headings impeccable's `document.md` names as a pitfall by exact string.

The detector was smoke-tested rather than assumed: nine planted anti-patterns, four caught by the
file tiers, and the five misses traced to the browser engine rather than written off.

## Attribution and license

Mixed licensing, documented per-source in [NOTICE](NOTICE).

| Part | Source | License |
|---|---|---|
| `.claude/skills/impeccable/` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 |
| `.claude/skills/{emil-design-eng, review-animations, improve-animations, animation-vocabulary}/` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT |
| `reference/marketing-rules.md` (derived) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | MIT |
| `design-arbiter/SKILL.md`, `conflicts.md`, `CLAUDE.md`, this README | original | see repo license |

Both vendored skill directories are unmodified. Every behavioural override lives in `CLAUDE.md`
or in `design-arbiter/`, so `npx impeccable update` and `npx skills update` keep working.
