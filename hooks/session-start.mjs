#!/usr/bin/env node
/**
 * SessionStart hook: inject the arbitration precedence card.
 *
 * Why this exists. The working agreement and the precedence rulings used to
 * live in this repo's CLAUDE.md, which meant they only applied inside this
 * repo. A Claude Code plugin cannot ship a CLAUDE.md, so the rulings travel
 * as injected context instead and now apply in every project the plugin is
 * installed into.
 *
 * Kept deliberately short. This is paid for on every session, including
 * backend-only ones. The full agreement, the routing table and the evidence
 * behind each ruling live in the design-arbiter skill, which loads on demand.
 *
 * Contract: never break a session. Always exit 0.
 */

import { preflight } from '../scripts/preflight.mjs';

const CARD = `[design-stack] Design precedence is in effect for any work that creates or changes UI.

Load the \`design-arbiter\` skill for the routing table, the surface modes, and the evidence
behind each ruling. It decides which source governs a decision; it carries no taste of its own.

Precedence, always in effect:
1. Motion mechanics: emil-design-eng. Component specs, \`:active { scale(0.97) }\`, never
   \`scale(0)\`, popover \`transform-origin\` (modals stay centered), transitions over keyframes
   for re-triggerable UI, \`transform\`/\`opacity\` only, \`prefers-reduced-motion\`, hover gated
   behind \`@media (hover: hover) and (pointer: fine)\`.
2. Motion volume: impeccable. One authored moment per surface. No per-section reveal floor.
3. Durations by surface mode. Operate/Read: 150-250ms, 300ms ceiling, no page-load
   choreography. Persuade/Experience: exactly one focal sequence at 500-800ms, rest under 300ms.
4. Easing: one token project-wide, \`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)\`. \`ease-in\`
   is banned on UI. emil's \`--ease-in-out\` and \`--ease-drawer\` stand.
5. Stack: impeccable. Inherit the incumbent framework, styling system, icons, and fonts.
   Never re-platform because a design skill prefers something else.
6. Copy: zero em dashes (U+2014) and zero en dashes (U+2013) in user-visible copy. Ranges
   use a plain hyphen. Source code and comments are exempt.
7. Review format: emil's \`| Before | After | Why |\` table for motion reviews only.
8. Skip emil's canned animations.dev first response; apply its content directly.

Before substantive design work run \`/impeccable init\` if PRODUCT.md is missing. \`init\` writes
PRODUCT.md only. DESIGN.md is written at finish from the built artifact by the
\`impeccable-documenter\` agent, or by \`/impeccable document\` for an incumbent system. A missing
DESIGN.md does not mean the project is greenfield.`;

function engineWarning(report) {
  if (report.engine.ok && report.engine.matchesPinned) return '';
  if (!report.engine.ok) {
    return `\n\n[design-stack] The impeccable engine is not responding: ${report.engine.reason}.`
      + ` Every detector hook fails until it does, so no design finding this session is`
      + ` evidence of anything. The launcher downloads engine ${report.pinned || 'the pinned version'}`
      + ` on first run, which needs network and a writable cache. Tell the user rather than`
      + ` treating a silent hook as a clean pass.`;
  }
  return `\n\n[design-stack] Engine version mismatch: ${report.engine.version} answered, but this`
    + ` plugin pins ${report.pinned}. Findings may not match the documented rule set.`;
}

async function main() {
  let warning = '';
  try {
    warning = engineWarning(preflight());
  } catch {
    // Preflight is a convenience. Never let it cost a session its context card.
  }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: CARD + warning,
    },
  }));
}

main().catch(() => {}).finally(() => process.exit(0));
