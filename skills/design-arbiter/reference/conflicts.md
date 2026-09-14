# Conflict rulings

Where the three installed sources give contradictory instructions, these rulings decide.
Each cites the conflicting text so the ruling is auditable rather than arbitrary.

Installed sources:
- **impeccable** `skills/impeccable/` - Apache-2.0, 62 detector rules + hooks
- **emil-design-eng** `skills/emil-design-eng/` - MIT, motion and component craft
- **taste-skill** - *not installed*; its countable rules are harvested into
  `marketing-rules.md`. See "Why taste-skill is not installed" below.

---

## 1. Motion volume → **impeccable wins**

- impeccable `reference/craft-floor.md`: *"one authored moment, not scattered effects and not
  one identical entrance on every section."*
- taste-skill §5: *"if MOTION_INTENSITY > 4, the page must actually move: entry transitions on
  hero, scroll-reveal on key sections, hover physics on CTAs, at minimum."*

**Ruling:** one authored motion moment per surface. Do not apply taste-skill's minimum-motion
floor. Supporting states (feedback, hover, focus) are not "motion" for this count - they are
required regardless and are governed by ruling 2.

**Why:** a per-section reveal floor is how pages end up with the same fade-and-rise on every
block, which is the exact tell both skills otherwise try to prevent.

---

## 2. Motion mechanics → **emil wins**

emil is the only source with component-level specifications. impeccable's `animate.md` is art
direction (focal moment, material by meaning, thesis) and carries none of this. They are not
competing; emil fills a gap.

Binding specs from emil:
- `:active { transform: scale(0.97) }` on every pressable element (subtle range 0.95-0.98)
- Never animate from `scale(0)` - start `scale(0.95)` + `opacity: 0`
- Popovers scale from their trigger: `transform-origin: var(--transform-origin)`.
  **Modals are exempt** and stay centered.
- Tooltips: delay the first, then instant with zero animation for adjacent ones
- CSS transitions over keyframes for anything rapidly re-triggered (transitions retarget,
  keyframes restart from zero)
- Animate `transform` and `opacity` only
- Framer Motion `x`/`y`/`scale` shorthands are **not** hardware-accelerated - use the full
  `transform` string when the main thread is under load
- Never animate a keyboard-initiated action seen 100+ times/day (command palette: zero animation)
- `@media (hover: hover) and (pointer: fine)` gate on every hover animation
- `prefers-reduced-motion` means fewer and gentler, not zero - keep opacity and color

impeccable 4.3 adopted that last one independently. `animate.md` now requires *"an intentional
alternative"* and says reduced motion *"means fewer and gentler animations, not disabling all
motion; feedback that confirms an action should remain legible."* The two sources agree, so this
bullet is no longer an emil-only position. Left in place because the ruling is about where the
component-level specs come from, and that answer has not changed.

---

## 3. Durations → **split by surface mode**

- emil: *"UI animations should stay under 300ms"* (button 100-160, tooltip 125-200, dropdown
  150-250, modal/drawer 200-500), and exempts "marketing/explanatory: can be longer".
- impeccable `animate.md`: allows **500-800ms** for *"a deliberately authored focal entrance"*.

A third number settles it. impeccable `operate.md` is more specific than either:
*"150-250 ms on most transitions. Users are in flow; don't make them wait for choreography."*
It also bans orchestrated page-load sequences outright on Operate surfaces.

**Ruling:**
- **Operate / Read surfaces** (app UI, dashboards, admin, settings, docs): **150-250ms on most
  transitions.** emil's per-element budgets are the ceiling, not the target - modals and drawers
  may reach 300ms, never past it. No orchestrated page-load sequences.
- **Persuade / Experience surfaces** (marketing, portfolio): impeccable's 500-800ms applies to
  **exactly one** focal sequence per page - the authored moment from ruling 1. Every other
  animation on the page stays under 300ms.

emil's exemption ("marketing/explanatory: can be longer") and impeccable's focal allowance are
the same carve-out described from different directions, so the only real tightening is on
Operate, where `operate.md` wins.

---

## 4. Easing → **one project token**

Three near-identical expo-out curves are in play:

| Source | Curve |
|---|---|
| impeccable `animate.md` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| taste-skill §5.C | `[0.16, 1, 0.3, 1]` |
| emil | `cubic-bezier(0.23, 1, 0.32, 1)` |

**Ruling:** `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` project-wide - it is the 2-of-3
majority and visually indistinguishable from emil's variant. Do not mix both into one codebase.

emil's other two curves have no counterpart and stand:
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for on-screen movement
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` for drawers

**`ease-in` is banned on UI regardless of source.** It delays initial movement at the exact
moment the user is watching most closely.

**emil's `animate` skill (ruling 14) restates its own curve, and resolves this itself.** It
declares `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` under a hard instruction: *"No approximated
values. Every curve, duration, and spring config comes from the tables below."* Read alone that
overrides this ruling. Read with the next line it does not: *"Extend the codebase's tokens, don't
fork them. If `--ease-out` or a duration scale already exists, use it. Adding a parallel system
is a defect."* This ruling puts `0.16, 1, 0.3, 1` in the project as `--ease-out`, so `animate`'s
own second rule binds it to that value. The first rule is about not inventing curves from
nothing, not about overriding a token that already exists. **Token in the project beats table in
the skill.** `animate`'s spring configs have no counterpart here and stand unchanged.

---

## 5. Stack and dependencies → **impeccable wins**

- taste-skill §3 prescribes React/Next + Tailwind v4 + Motion + Phosphor icons (discourages
  Lucide) + Geist/Satoshi/Cabinet Grotesk.
- impeccable: *"The brief wins"*, and requires inspecting *"at least one representative source
  of incumbent visual truth (tokens, theme, CSS, component, or asset) before editing."*

**Ruling:** inherit the incumbent framework, styling system, icon library, and font stack.
Never re-platform because a design skill prefers a different one. This is the single largest
practical risk in stacking these sources and is the main reason taste-skill is not installed
as an auto-triggering skill.

**When there is no incumbent**, impeccable 4.3 added the missing half: `init.md` now says that
on a project with no framework or scaffold, *"the stack is a user decision, not yours: ask once
whether they want plain static HTML/CSS, a specific framework, or your recommendation"*, and
records the answer under `## Stack` in PRODUCT.md, writing `delegated` when the user hands the
choice back. So the full rule is: inherit an incumbent, ask on a greenfield, and never let a
design skill's stack preference decide either way.

---

## 6. Em-dash → **zero in user-visible copy**

These agree more than the detector rule name suggests:

- taste-skill §9.G: absolute ban, no limited-use allowance. Its own wording:
  *"The agent has historically ignored em-dash limits when phrased as 'use sparingly.' The
  phrasing here is binary: zero em-dashes."*
- impeccable's **detector** rule is `em-dash-overuse`, a frequency threshold, and it is
  classified advisory - it never counts as a failure or changes the exit code.
- But impeccable's own **authoring** standard is zero. `docs/STYLE.md` denylists em dashes, and
  `validateSkillProse` in the build **fails `bun run build`** on an em dash anywhere in
  `skill/**/*.md`. Code comments are exempt; prose is not.

Note the scope of that evidence: `validateSkillProse` bans **em** dashes only, and impeccable's
own reference markdown uses en dashes freely (`65-75ch`). Extending the ban to en dashes is this
arbiter's decision, taken for one consistent rule rather than two, not an upstream requirement.

**Ruling:** zero em dashes (U+2014) and zero en dashes (U+2013) in user-visible copy: headlines,
eyebrows, labels, buttons, body, quotes, attribution, captions, alt text. Use a comma, colon,
period, parentheses, or a plain hyphen. Ranges use a hyphen (`2018-2026`, `EUR 40-80k`).

Grep for them by codepoint, not by pasting the glyph: a naive find-and-replace over a file that
documents this rule will silently mangle the rule's own examples.

Applies to **rendered copy only** - not source code, comments, or documentation. The advisory
detector rule will under-report this; the rule above is the standard, not the detector output.

---

## 7. Review output format → **scoped, not global**

emil's SKILL.md mandates a `| Before | After | Why |` markdown table for UI review and
explicitly forbids the list form. impeccable's `critique` and `audit` have their own scoring
formats.

**Ruling:** emil's table is required for **motion and interaction-state reviews**.
`/impeccable audit`, `/impeccable critique`, and `/impeccable polish` keep their native output.
Neither reformats the other.

---

## 8. emil's canned first response → **suppressed**

emil's SKILL.md opens with an instruction to reply *only* with a line advertising
animations.dev and to withhold all other information until asked again.

**Ruling:** skip it. Apply the skill's content directly. The upstream file is left unmodified
so `npx skills update` keeps working; this override lives here and in `CLAUDE.md` instead.

---

## 9. Who writes DESIGN.md, and when → **impeccable, at finish**

Not a conflict between sources - a correction to an assumption that is easy to get wrong and
that this project got wrong initially.

- `init.md`: *"`init` captures durable product truth in PRODUCT.md. It does not invent a visual
  world and does not write DESIGN.md."* and *"Never silently overwrite an existing file or offer
  DESIGN.md during init."*
- `new-work.md` §7: on new or replaced worlds, `DESIGN.md` is written **after the build**, from
  the shipped artifact. The installed 4.0.2 text says *"After a first implementation of a new
  world, update DESIGN.md with the exact tokens and behaviors that survived the build."*
- The `impeccable-documenter` agent is the shipped way to do that pass with fresh eyes. It is
  vendored at `agents/impeccable-documenter.md` and its own brief carries the rationale:
  *"a rulebook written before the build gets defended against reality instead of describing it."*
- `/impeccable document` is the separate path for recording an **incumbent** system.

**Ruling:** never treat a missing `DESIGN.md` as evidence that a project is greenfield, and
never hand-write one before a build. `PRODUCT.md` gates the work; `DESIGN.md` records it.

Note also that impeccable's README says init "offers DESIGN.md" - the skill reference
contradicts it and the skill reference is authoritative.

## 10. Who owns the finish → **impeccable, on new work**

`new-work.md` §7 already specifies a bounded finish: inspect desktop and mobile in one batched
screenshot round, fix material gaps, confirm with one more round (*"two rounds is the ceiling,
and fixes batch between them rather than earning per-tweak screenshots"*), then spawn the
`impeccable-finish-reviewer` agent (fresh eyes outside the build thread's attention gravity),
apply its short list of material fixes, and stop. Then the `impeccable-documenter` agent records
`DESIGN.md` from the built world. It ends with *"Do not run a second detector."*

Verified against impeccable 4.3.1. An earlier revision of this ruling carried a version note
because the bounded-finish wording existed only on main and not in the vendored 4.0.2; the 4.3
releases shipped it, so the note is retired.

**Ruling:** on new work, do not substitute an independent finish chain for that flow. The
arbiter's own finish steps apply to **refinement of existing code**, where no direction contract
or approved comp exists for a reviewer to audit against.

Related: for a genuinely open new surface, `new-work.md` runs a two-stage concept roll
(`impeccable concept-seed --scope surface`, then `--scope direction`) that deliberately assigns
a direction from outside the model's own ranking, presents it on a visual decision page, and
always offers what 4.3 calls **the standing exit**: *"one quiet, permanent alternative, the
category standard, played straight. It is the user's door."* Do not route around that machinery
by picking a direction directly. Its whole purpose is that a single ranking is deterministic and
always ships the same safe candidate, and the standing exit is what keeps the roll from forcing
a novelty the user did not want.

## 11. Image-first workflows: `image-to-code` vs `visualize.md` → **impeccable wins**

taste-skill ships `image-to-code`, which is **not** an image-generation skill despite sitting
beside three that are. It writes frontend code, and it mandates its own workflow: generate the
reference images, analyse them deeply, then implement.

Impeccable also goes image-first, through `visualize.md` (loaded from `new-work.md` whenever any
image generation is available, and described there as *"proven to produce the most compositional
and ambitious work"*). The two disagree on what happens next:

| | `image-to-code` | impeccable `visualize.md` |
|---|---|---|
| How many comps | one per section, 6-12 typical | exactly three compositional options |
| User approval | none; proceeds to implementation | hard gate, *"stop and wait"* before any code |
| Relationship to the image | *"not inspired by the image... visually faithful to the image"* (§26), plus an anti-drift rule (§27) | *"a north star, not something to trace"*, and *"do not rasterize core UI text or controls"* |
| Raster vs semantic | no equivalent step | an explicit fidelity inventory bucketing every element `produce` / `direct` / `semantic` |

**Ruling:** use `visualize.md`. Three comps, one approval gate, comp as north star, and the
fidelity inventory before building. `image-to-code`'s copy discipline would trace UI text and
controls into rasters that impeccable's inventory step exists specifically to keep semantic.

**Whether to go image-first at all is now a recorded setting, not a per-surface call.**
impeccable 4.3 has `init` ask once, when image generation is available, and write
`.impeccable/config.json` as `"buildPath": "comp"` or `"code"`: comp-first means an image sets
the bar before any code (bolder composition, slower, the build must match the image), code-first
means building directly with the ambition carried by the direction contract. `new-work.md` is
explicit that this *"is a workflow preference, not a per-surface decision; no round asks it."*
So do not re-litigate it per surface, and do not infer it from silence: unrecorded means
comp-first where image generation exists, said out loud for that session and not stored.

`image-to-code` is not installed, so this is latent rather than live. It is recorded because the
image-first workflow is a reasonable thing to reach for, and reaching for that skill by name
would quietly replace impeccable's approval gate and fidelity inventory with neither.

The other three (`brandkit`, `imagegen-frontend-web`, `imagegen-frontend-mobile`) emit images
only and carry no code guidance. `imagegen-frontend-mobile` says so in its own frontmatter:
*"This skill generates images only. It does not write code."* Nothing in them can contradict a
ruling here, and they compose fine with `visualize.md` as comp generators.

## 12. Who may author DESIGN.md → **impeccable's format, always**

taste-skill ships `stitch-design-taste`, whose entire job is generating `DESIGN.md` files. The
one it ships as its own example uses these headings:

`## 1. Visual Theme & Atmosphere` · `## 2. Color Palette & Roles` · `## 3. Typography Rules` ·
`## 4. Component Stylings` · `## 5. Hero Section` · `## 6. Layout Principles` ·
`## 7. Responsive Rules` · `## 8. Motion & Interaction` · `## 9. Anti-Patterns`

impeccable's `document.md` lists that exact failure among its pitfalls:

> *"Don't rename sections even slightly. 'Colors' not 'Color Palette & Roles'. 'Typography' not
> 'Typography Rules'. Tooling parsing depends on exact headers."*

The canonical order is `Overview`, `Colors`, `Typography`, `Layout`, `Elevation & Depth`,
`Shapes`, `Components`, `Do's and Don'ts`, unnumbered, preceded by Stitch-schema YAML
frontmatter. A `stitch-design-taste` file has no frontmatter, numbers its headings, renames most
of them, and adds a `Hero Section` and `Responsive Rules` section the spec does not define.

**Ruling:** never let `stitch-design-taste` write this project's `DESIGN.md`. Its output would
not parse for impeccable's design-system detector rules (`design-system-color`,
`design-system-font`, `design-system-font-size`, `design-system-radius`) or for the live panel,
both of which read that file. Use `/impeccable document`, which follows the spec.

The irony is worth noting: both skills target the same Google Stitch format, and only one of
them actually conforms to it.

## Why taste-skill is not installed

Its main `SKILL.md` is a single 87 KB file (~24k tokens) with no progressive disclosure -
roughly 8× impeccable's resting cost - and its trigger description is broad enough to fire on
work it explicitly says it does not cover (*"Not dashboards, not data tables, not multi-step
product UI"*). Installing it alongside impeccable means loading two full design vocabularies
into the same context on tasks where one of them has opted out.

Its genuinely valuable contribution is its **countable composition rules**, which impeccable
has no equivalent for. Those are harvested into `marketing-rules.md`, cost nothing at rest, and
load only for the surfaces they apply to.

To use it directly anyway for a greenfield marketing exploration:
`npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`
Then run `/impeccable document` afterwards to fold the result into `DESIGN.md`, and remove it
again. Do not leave it installed during product-UI work.

## 13. Eyebrows and kickers → **banned, impeccable wins**

New in impeccable 4.3. This one matters more than its size suggests because the two sources
are not symmetrical here: one is prose, the other fires on every edit.

- taste-skill's hero rule permits one: *"Optional eyebrow OR brand strip (pick zero or one),
  headline, subtext, CTAs."* Two of its other rules presuppose eyebrows exist, scoping version
  labels and micro-meta sentences to them.
- impeccable 4.0 agreed, loosely. `craft-floor.md` listed *"a tracked uppercase eyebrow over
  every section"* as a default to avoid, and the detector rule `repeated-section-kickers` fired
  only on repetition.
- impeccable 4.3 hardened both. `craft-floor.md` now reads: *"A kicker or eyebrow above a
  heading. This one is a ban, not a default: no brief earns it back."* The old detector rule is
  gone, replaced by `kicker-above-heading`: *"banned outright, repeated or not."*

**Ruling:** no kicker or eyebrow above any heading, anywhere, on any surface. The hero carries
headline, subtext, and CTAs: three text elements, not four. If the eyebrow's words matter, work
them into the heading or the body.

**Why the asymmetry decides it.** A permissive prose rule against a deterministic detector rule
is not a real contest. Leaving the permission in `marketing-rules.md` would have the arbiter
instruct a model to build something the `PostToolUse` hook flags on the very next edit, which
costs a round trip every time and teaches the model to distrust one of the two sources. When a
prose source and an enforced source disagree, the enforced one wins by default; the only
question worth asking is whether the enforcement is wrong, and here it is not.

`marketing-rules.md` has been amended accordingly: the hero budget drops to three text
elements, and the two rules that scoped themselves to eyebrows now scope to headings.

## 14. Motion authorship: `/impeccable animate` vs emil's `animate` → **sequence, not contest**

emil shipped a new `animate` skill in August. It auto-triggers on *"animate something, add
motion, make a component feel alive, or build a transition"*, and unlike `emil-design-eng` it
**writes the implementation**. That overlaps `/impeccable animate` on trigger, so on the surface
it looks like the exact collision this project exists to prevent.

It is not, because the two work at different layers:

| | owns | answers |
|---|---|---|
| `/impeccable animate` | art direction | should this move, what is the focal moment, what material does it have in this world |
| `emil-design-eng` | reference | component-level specs, interaction states, the craft floor for motion |
| emil `animate` | procedure | given it moves: which tool, which properties, curve or spring, how it interrupts, how it exits, and the code |

**Ruling:** they run in that order on a surface that needs authored motion. `/impeccable animate`
decides **whether and what**. emil's `animate` decides **how** and writes it. Never let `animate`
fire first and settle the thesis by implication: a motion that is technically excellent and
directionally arbitrary is the failure this ordering prevents. If only one is going to run,
on a Persuade or Experience surface it is `/impeccable animate`, because direction is the part
nothing else supplies.

**Why take it at all.** It carries three things no other installed source has: spring configs
with criteria for reaching for one instead of a curve, asymmetric timing (slow on the deliberate
phase, snappy on the system response), and interruption and exit behavior. Motion that survives
being interrupted is most of the distance between competent and delightful, and it is the part
models get wrong by default.

**Why this does not violate the no-second-vocabulary rule.** The warning this project is built
on is about base-layer design skills, each carrying a full worldview about what a page should
look like. `animate` has no aesthetic opinions. It is a specialist in one narrow decision, the
same slot `emil-design-eng` already occupies, and the layering model has room for specialists.
A third full vocabulary would still be refused.

Not adopted from the same release: `prototype` (redundant against `/impeccable live`, which has
identity lock, parameter knobs and carbonize cleanup), `pick-ui-library` (would work against
ruling 5), `apple-design` (a base-layer aesthetic vocabulary, refused on the rule above), and
`animate-expo`, `ask-sonner`, `write-swift` (out of scope for this stack).
