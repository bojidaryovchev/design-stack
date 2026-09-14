---
name: design-arbiter
description: Routes design work across the installed design skills (impeccable, emil-design-eng) and rules on the points where they contradict each other. Use when starting any UI work, when two design sources give conflicting guidance on motion timing, easing, stack choice, or copy, when building or reviewing a marketing/landing/portfolio surface, or when deciding which design command to run. Carries no aesthetic opinions of its own.
---

# Design arbiter

This project stacks three design sources. This skill decides which one governs a given
decision. **It contributes no design taste of its own** - that discipline is what keeps it from
becoming a fourth competing vocabulary, which is the failure mode it exists to prevent.

## Sources and what each owns

| Source | Owns | Installed as |
|---|---|---|
| **impeccable** | Base vocabulary, process, art direction, enforcement | `.claude/skills/impeccable/` + edit hooks |
| **emil-design-eng** | Motion mechanics and component interaction specs | `.claude/skills/emil-design-eng/` |
| **taste-skill** | Countable composition rules for marketing surfaces | harvested → `reference/marketing-rules.md` |

impeccable is the base because it is the only source with deterministic enforcement: 59
detector rules across regex, static-HTML, browser, and visual engines, wired to a `PostToolUse`
hook on every edit and a `Stop` deep pass. Those fire whether or not the model was paying
attention to any prose. The other sources are prose, and prose only works under attention.

### Detector tiers - what actually fires, and when

The three engines do **not** cover the same rules, and this matters operationally:

| Tier | Runs on | Catches | Needs |
|---|---|---|---|
| regex | any source file | literal patterns: `side-tab`, `gradient-text`, `overused-font`, `bounce-easing`, `gray-on-color` | nothing |
| static-HTML | `.html`, with `<style>` or linked CSS | cascade-resolved rules: `oversized-h1`, `extreme-negative-tracking`, `cream-palette`, `cramped-padding`, `icon-tile-stack`, `italic-serif-display`, `hero-eyebrow-chip`, `dark-glow`, `broken-image`, `clipped-overflow-container`, `flat-type-hierarchy`, `single-font` | `htmlparser2`, `css-select`, `css-tree`, `domutils` |
| browser + visual | **a rendered URL only** | structural and computed rules: `nested-cards`, `tiny-text`, `low-contrast`, `text-occlusion` | `puppeteer` |

Two failure modes to know:

**The static-HTML engine fails open.** When its four parser dependencies are absent,
`engines/static-html/detect-html.mjs` catches the import error and falls back to the regex
engine. The scan reports zero findings and exits 0. That reads as clean when it means
not checked. Run `node <plugin-root>/scripts/preflight.mjs` to see which tiers are live; the
SessionStart hook warns automatically when one is down.

**The per-edit hook surfaces only a 14-rule immediate tier.** Everything else defers to the
`Stop` deep pass (see `IMMEDIATE_TIER_RULES` in `scripts/hook-lib.mjs`). Several of those 14
(`low-contrast`, `tiny-text`) are browser-tier rules that cannot fire from a file edit at all,
and four more are design-system rules that need a `DESIGN.md` to compare against.

So a clean hook result is not a clean bill of health. Before shipping a surface, run
`/impeccable audit <target>` against a running dev server, or scan the URL directly:
`node <plugin-root>/.claude/skills/impeccable/scripts/detect.mjs http://localhost:3000`
(add `--viewport 390x844` for a mobile pass).

## Working agreement - run this without being asked

The user should never have to name a command. On any request that creates or changes UI,
follow this chain automatically. Do not present it as a menu and do not ask permission to
run it.

1. **Context.** If `PRODUCT.md` is missing and the request is a whole surface or a new visual
   direction, run `/impeccable init` first and say why in one line. For a narrow tweak to
   existing code, skip init, do the work, and offer it once at the end.
2. **Mode.** State the surface mode in one line before building: *"Building this as a Persuade
   surface"* (or Operate / Read / Experience). This is not decoration; it selects the duration
   ruling and decides whether the marketing rules apply.
3. **Build**, with the precedence in "Conflict rulings" applied.
4. **Finish.** Three regimes. Pick one; never stack them.

   **Live mode is running (`/impeccable live`) then run no finish chain at all.** The overlay's
   preview is the verification channel. Apply the craft floors by construction as you write,
   not as an inspection pass afterward. Full verification runs once, at accept, during
   carbonize cleanup. Inserting an audit mid-cycle stalls the user's picker.

   **New surface or replaced visual world then impeccable owns the finish. Do not substitute
   your own.** `new-work.md` section 7 specifies it: inspect desktop and mobile, fix material
   gaps, re-inspect, then spawn `impeccable-finish-reviewer` (it audits the render against the
   direction contract and the approved comp), apply its fixes in one batch, and stop. Then
   spawn `impeccable-documenter` to write `DESIGN.md` from the built world. **Do not run a
   second detector** and do not re-open your own defect hunt after the reviewer returns.

   **Refinement of existing code then the lighter chain.** Run whichever apply, then fix
   everything they return in one batch:
   - motion was touched: apply the emil specs, and check the work against
     `review-animations/STANDARDS.md` (read it directly; the `review-animations` skill is
     `disable-model-invocation: true` and cannot be self-invoked). For a codebase-wide motion
     roadmap, `improve-animations` can be invoked normally.
   - Persuade or Experience surface: the pre-flight in `reference/marketing-rules.md`
   - a dev server is running: scan the URL directly, since this is the only way the structural
     and contrast rules can fire
   - otherwise: `/impeccable audit <target>`
5. **Report** in two or three lines: mode, what the checks returned, what you fixed, and
   anything you deliberately left, with the reason.

**Bounded, not looping.** Inspect once in a batched round covering desktop and mobile together,
fix in one batch, confirm with at most one more round, then stop. Open-ended self-QA burns
money doing worse what the finish handoffs do better.

**Scale to the request.** A one-line CSS fix does not get the full chain; the edit hook still
runs and that is enough. Step 4 applies to a surface, a component, or a visible change to how
something looks or moves.

**Escape hatches, always honored.** "quick fix", "skip the design pass", "don't audit", or a
named command ("just run polish") overrides all of the above for that turn.

## Routing

**Before any design work:** run `/impeccable init` if `PRODUCT.md` is missing; without it the
commands fall back to generic SaaS patterns. **`init` writes `PRODUCT.md` only.** `DESIGN.md`
is written at finish by the `impeccable-documenter` subagent, or by `/impeccable document` for
an incumbent system. A missing `DESIGN.md` is not a reason to run `init`. See ruling 9.

| Task | Route to |
|---|---|
| New surface, or replacing the visual world | `/impeccable shape`, then new-work |
| Plan UX before code | `/impeccable shape` |
| Typography, color, layout, spacing | `/impeccable typeset` · `colorize` · `layout` |
| Too bland / too loud / too complex | `/impeccable bolder` · `quieter` · `distill` |
| **Adding motion - direction and thesis** | `/impeccable animate` |
| **Adding motion - durations, easing, component specs** | `emil-design-eng` (see ruling 2) |
| **Reviewing motion** | `review-animations`, or `improve-animations` for a codebase pass |
| Naming a motion precisely | `animation-vocabulary` |
| Visual iteration in the browser | `/impeccable live` (needs a dev server; see below) |
| UX review / technical audit / ship pass | `/impeccable critique` · `audit` · `polish` |
| Copy, edge cases, responsive | `/impeccable clarify` · `harden` · `adapt` |
| Capture the system from existing code | `/impeccable document`, `/impeccable extract` |
| Don't know | `/impeccable` with no argument - it reads live signals and recommends |

## Surface mode drives everything

impeccable classifies each surface as **Persuade** (marketing, landing, pricing), **Operate**
(app UI, dashboards, admin, tools), **Read** (docs, articles), or **Experience** (portfolio,
gallery). Pick it from the surface, not the product - a dev tool's landing page is still
Persuade; a fashion house's docs are still Read.

The mode is not cosmetic here. It decides two live rulings:

- **Durations.** Operate/Read: 150-250ms on most transitions, 300ms absolute ceiling, no
  page-load choreography. Persuade/Experience: one focal sequence may run 500-800ms; everything
  else stays under 300ms.
- **Marketing rules.** `reference/marketing-rules.md` applies to Persuade and Experience
  **only**. Loading it for a dashboard imports rules its own author excluded.

## Conflict rulings

Read `reference/conflicts.md` when two sources disagree, or when you want the evidence behind a
ruling. Summary:

1. **Motion volume** → impeccable. One authored moment per surface, not a per-section floor.
2. **Motion mechanics** → emil. Component specs, `:active` scale, `transform-origin`, GPU rules.
3. **Durations** → split by mode, above.
4. **Easing** → one token: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. `ease-in` banned on UI.
5. **Stack** → impeccable. Inherit the incumbent framework, icons, and fonts. Never re-platform.
6. **Em-dash** → zero in user-visible copy.
7. **Review format** → emil's Before/After/Why table for motion reviews only.
8. **emil's canned first response** → suppressed; apply the content directly.
9. **DESIGN.md** → written by impeccable at finish, never by `init` and never by hand.
10. **The finish** → impeccable owns it on new work; the arbiter's chain is for refinement only.
11. **Image-first** → impeccable's visualize.md, not taste-skill's image-to-code.
12. **Who may author DESIGN.md** → impeccable's format always. Never `stitch-design-taste`,
    whose headings `document.md` names as a pitfall by exact string.

## Live mode has its own rules

`/impeccable live` is not the normal flow with a browser attached. Three things differ:

- **No finish chain runs.** The overlay's preview is the verification channel. Do not
  screenshot, re-render, or audit between generate and accept; apply the craft floors by
  construction as you write. Full verification happens once, at accept, during carbonize
  cleanup.
- **Variation within identity, not between identities.** Phase A extracts an identity lock from
  `DESIGN.md`, CSS custom properties, computed styles, and sibling components, in that order.
  Default mode preserves it and varies one axis per variant, and `live.md` puts that at roughly
  90% of sessions. Departure mode needs the user to ask for it explicitly in the current
  request; a stale critique is not authorization. If unsure, you are in default mode.
- **Parameters are part of the design.** Each variant declares 0-4 coarse knobs sized to the
  element's visual weight: 0 for a button, 2-3 for a hero. Shipping a hero with zero knobs is
  the common failure, not a judgement call.

## Two things not to route around

**The concept roll.** For a genuinely open new surface, `new-work.md` runs
`concept-seed.mjs` to assign a direction from outside your own ranking, deals catalog
challengers, and puts the decision on a served page (`serve-question.mjs`). Its entire purpose
is that a single ranking is deterministic and therefore always ships the same safe candidate.
Picking a direction directly defeats it.

**a11y at design time.** impeccable deliberately keeps accessibility guidance in `audit.md`
rather than in the design-time path, because models over-correct into safe, underdesigned output
when reminded about accessibility while composing. Do not add a11y rules to this skill or to
`CLAUDE.md`. Run `/impeccable audit` instead - that is where the check belongs.

## Marketing and portfolio surfaces

Load `reference/marketing-rules.md`. It carries the countable composition rules impeccable has
no detector for - hero stack limits, layout-family repetition, zigzag caps, bento cell counts,
the color/shape/theme locks, CTA intent dedup, and the decoration-tell bans. Every rule in it
was checked against impeccable's 59 rule IDs for non-duplication.

It also carries the redesign preservation rules (SEO baseline, nav labels, form field names,
route slugs) and the out-of-scope routing table for surfaces these rules do not fit.

Its closing pre-flight is harvested from taste-skill's own final checklist, scoped to marketing
surfaces and deduped against impeccable's detector rules. Run it before declaring done.

## What not to do

- Do not install a second full design vocabulary alongside impeccable. Two vocabularies in one
  context cancel out - this is impeccable's own stated warning about Anthropic's
  `frontend-design` skill and it applies equally to any other base-layer design skill.
- Do not add aesthetic rules to this skill. Direction belongs in `DESIGN.md`, where impeccable
  enforces it. Rules here are routing and arbitration only.
- Do not edit files under `.claude/skills/impeccable/` or `.claude/skills/emil-design-eng/` -
  both are upstream and updatable (`npx impeccable update`, `npx skills update`). Overrides
  belong in `CLAUDE.md` or this skill.
