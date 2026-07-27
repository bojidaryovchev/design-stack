# Project

## Design stack

Three design sources are layered here. `design-arbiter` routes between them and rules on the
points where they contradict. The rulings below are always in effect; the reasoning and
evidence live in `.claude/skills/design-arbiter/reference/conflicts.md`.

**Base:** impeccable (`/impeccable <command>`).

**How the two context files actually get written** - do not conflate them:
- `PRODUCT.md` is product truth (users, purpose, positioning, constraints, platform). Written by
  `/impeccable init`. **`init` never writes or offers `DESIGN.md`.**
- `DESIGN.md` is the visual system. On new work it is written **at finish**, from the built
  artifact, by the `impeccable-documenter` subagent - a rulebook written before the build gets
  defended against reality instead of describing it. For an existing incumbent system, use
  `/impeccable document`.
  It is **not** free-form markdown: it follows the Google Labs `design.md` spec, with YAML
  frontmatter whose schema accepts only `colors`, `typography`, `rounded`, `spacing`, and
  `components`, then up to eight canonical sections in fixed order. Motion, shadows, and
  breakpoints have no place in that frontmatter; they live in the `.impeccable/design.json`
  sidecar under `extensions`. Never hand-write it, never rename a section, and never overwrite
  an existing one without asking.

So: run `/impeccable init` before substantive design work (without `PRODUCT.md` the commands
fall back to generic SaaS patterns), and let `DESIGN.md` arrive at the end. A missing
`DESIGN.md` does not mean the project is greenfield and does not route back to `init`.

**Enforcement is live.** An Impeccable detector hook runs after every `Edit`/`Write`/`MultiEdit`
on UI files, plus a deep pass on `Stop`. Act on its findings rather than re-auditing the same
rules by hand.

**A clean hook result is not a clean bill of health.** The hook runs the file-based tiers only.
Structural and contrast rules (`nested-cards`, `tiny-text`, `low-contrast`, `text-occlusion`)
exist only in the browser tier and cannot fire without a rendered page. Before shipping a
surface, run `/impeccable audit <target>` against a running dev server.

### Working agreement - run this without being asked

The user should never have to name a command. On any request that creates or changes UI,
follow this chain automatically. Do not present it as a menu and do not ask permission to
run it.

1. **Context.** If `PRODUCT.md` is missing and the request is a whole surface or a new visual
   direction, run `/impeccable init` first and say why in one line. For a narrow tweak to
   existing code, skip init, do the work, and offer it once at the end.
2. **Mode.** State the surface mode in one line before building: *"Building this as a Persuade
   surface"* (or Operate / Read / Experience). This is not decoration - it selects the duration
   ruling and decides whether the marketing rules apply.
3. **Build**, with the precedence below applied.
4. **Finish.** Three regimes. Pick one; never stack them.

   **Live mode is running (`/impeccable live`) → run no finish chain at all.** `live.md`: *"the
   overlay's preview IS the verification channel... Do not screenshot, re-render, or QA variants
   between generate and accept."* Apply the craft floors by construction as you write, not as an
   inspection pass afterward. Full verification runs once, at accept, on the chosen variant
   during carbonize cleanup. Inserting an audit mid-cycle stalls the user's picker.

   **New surface or replaced visual world → impeccable owns the finish. Do not substitute
   your own.** `new-work.md` §7 specifies it: one batched screenshot round covering desktop and
   mobile together, fix material gaps, one confirming round, **two rounds is the ceiling** -
   then spawn `impeccable-finish-reviewer` (it audits the render against the direction contract
   and the approved comp), apply its fixes in one batch, rebuild once, and stop. Then spawn
   `impeccable-documenter` to write `DESIGN.md` from the built world. **Do not run a second
   detector** and do not re-open your own defect hunt after the reviewer returns - it ran so
   that you don't have to.

   **Refinement of existing code → the lighter chain.** Run whichever apply, then fix
   everything they return in one batch:
   - motion was touched → apply the emil specs, and check the work against
     `.claude/skills/review-animations/STANDARDS.md` (read it directly - the
     `review-animations` skill is user-invocable only and cannot be self-invoked). For a
     codebase-wide motion roadmap, `improve-animations` can be invoked normally.
   - Persuade or Experience surface → the pre-flight in
     `.claude/skills/design-arbiter/reference/marketing-rules.md`
   - a dev server is running → `node .claude/skills/impeccable/scripts/detect.mjs <url>`,
     since this is the only way the structural and contrast rules can fire
   - otherwise → `/impeccable audit <target>`
5. **Report** in two or three lines: mode, what the checks returned, what you fixed, and
   anything you deliberately left (with the reason).

**Bounded, not looping.** Inspect once in a batched round covering desktop and mobile together,
fix in one batch, confirm with at most one more round, then stop. Open-ended self-QA burns
money doing worse what the finish handoffs do better.

**Scale to the request.** A one-line CSS fix does not get the full chain - the edit hook still
runs and that is enough. Step 4 applies to a surface, a component, or a visible change to how
something looks or moves.

**Escape hatches, always honored.** "quick fix", "skip the design pass", "don't audit", or a
named command ("just run polish") overrides all of the above for that turn.

### Precedence

1. **Motion mechanics** → `emil-design-eng`. Component specs, `:active { scale(0.97) }`, never
   `scale(0)`, popover `transform-origin` (modals stay centered), transitions over keyframes for
   re-triggerable UI, `transform`/`opacity` only, `prefers-reduced-motion`, hover gated behind
   `@media (hover: hover) and (pointer: fine)`.
2. **Motion volume** → impeccable. One authored moment per surface. Do not apply a
   per-section reveal floor.
3. **Durations** → by surface mode.
   **Operate/Read** (app UI, dashboards, docs): **150-250ms on most transitions**
   (impeccable `operate.md`), with emil's per-element budgets as the ceiling - modals and
   drawers may reach 300ms, never past it. No orchestrated page-load sequences: users load into
   a task, they don't want to watch it arrive.
   **Persuade/Experience** (marketing, portfolio): exactly one focal sequence may run
   500-800ms; everything else stays under 300ms.
4. **Easing** → one token project-wide: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
   emil's `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` and
   `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` stand - they have no counterpart.
   **`ease-in` is banned on UI.** These get recorded in `.impeccable/design.json` under
   `extensions.motion[]`, not in `DESIGN.md` frontmatter, which has no motion token group.
5. **Stack** → impeccable. Inherit the incumbent framework, styling system, icon library, and
   fonts. Never re-platform because a design skill prefers something else.
6. **Em-dash** → zero em dashes (U+2014) and zero en dashes (U+2013) in user-visible copy
   (headlines, labels, buttons, body, quotes, captions, alt text). Ranges use a plain hyphen.
   Source code and comments are exempt; skill markdown in this repo is not, since impeccable's
   own build fails on them there.
7. **Review format** → emil's `| Before | After | Why |` table for motion reviews only.
   `/impeccable audit`, `critique`, and `polish` keep their native output.
8. **emil's canned first response** → skip it. The skill instructs a one-line animations.dev
   reply before answering anything; apply its content directly instead.

### Marketing and portfolio surfaces only

Load `.claude/skills/design-arbiter/reference/marketing-rules.md` for Persuade/Experience
surfaces. Do not apply it to dashboards, data tables, or multi-step product UI - its upstream
source explicitly excludes those.

### Do not

- Install a second base-layer design skill. Two full design vocabularies in one context cancel
  each other out.
- Edit anything under `.claude/skills/impeccable/` or `.claude/skills/emil-design-eng/`. Both
  are upstream and updatable (`npx impeccable update`, `npx skills update`). Overrides go in
  this file or in `design-arbiter`.
