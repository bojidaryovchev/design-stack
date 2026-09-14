#!/usr/bin/env node
/**
 * Refresh the vendored upstream skills.
 *
 * Both upstream installers only write to `.claude/skills/`: impeccable's CLI
 * takes `--providers`, `--scope` and `--source` and nothing else, and project
 * scope is always `<provider>/skills`. Claude Code, meanwhile, discovers plugin
 * skills only from `skills/` at the plugin root.
 *
 * So this script lets the installers write where they insist, then moves the
 * result to where the plugin loader looks, and removes the staging directory.
 *
 *   node scripts/sync-upstream.mjs            run the installers, then sync
 *   node scripts/sync-upstream.mjs --sync-only   skip the installers
 *
 * `design-arbiter` is this project's own work and lives only in `skills/`. It is
 * never staged and never overwritten. The script refuses to run if a sync would
 * touch it.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGING = path.join(ROOT, '.claude', 'skills');
const DEST = path.join(ROOT, 'skills');
const OURS = 'design-arbiter';

const UPSTREAM = ['impeccable', 'emil-design-eng', 'animate', 'review-animations', 'improve-animations', 'animation-vocabulary'];

const INSTALLERS = [
  ['npx', ['-y', 'impeccable', 'install', '--providers=claude', '--scope=project']],
  ['npx', ['-y', 'skills', 'add', 'emilkowalski/skills',
    '-s', 'emil-design-eng', '-s', 'animate', '-s', 'review-animations',
    '-s', 'improve-animations', '-s', 'animation-vocabulary',
    '--agent', 'claude-code', '--copy', '-y']],
];

function run(cmd, args) {
  process.stdout.write(`\n> ${cmd} ${args.join(' ')}\n`);
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
}

function main() {
  const syncOnly = process.argv.includes('--sync-only');

  if (!syncOnly) {
    for (const [cmd, args] of INSTALLERS) run(cmd, args);
  }

  if (!fs.existsSync(STAGING)) {
    process.stderr.write(`nothing staged at ${path.relative(ROOT, STAGING)}\n`);
    process.exit(1);
  }

  const staged = fs.readdirSync(STAGING, { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name);

  if (staged.includes(OURS)) {
    process.stderr.write(
      `refusing to sync: an installer staged "${OURS}", which is this project's own work.\n`
      + `Inspect ${path.relative(ROOT, path.join(STAGING, OURS))} by hand before continuing.\n`
    );
    process.exit(1);
  }

  for (const name of staged) {
    const to = path.join(DEST, name);
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(path.join(STAGING, name), to, { recursive: true });
    process.stdout.write(`synced ${name}\n`);
  }

  fs.rmSync(path.join(ROOT, '.claude'), { recursive: true, force: true });

  const missing = UPSTREAM.filter((n) => !fs.existsSync(path.join(DEST, n, 'SKILL.md')));
  if (missing.length) {
    process.stderr.write(`\nWARNING: no SKILL.md for ${missing.join(', ')}\n`);
    process.exit(1);
  }
  if (!fs.existsSync(path.join(DEST, OURS, 'SKILL.md'))) {
    process.stderr.write(`\nWARNING: ${OURS} went missing. Restore it from git before committing.\n`);
    process.exit(1);
  }

  process.stdout.write(
    '\nDone. Still to do by hand:\n'
    + '  1. Refresh agents/ from .design-sources/pbakaus-impeccable/plugin/agents/\n'
    + '  2. Re-check the rulings that quote upstream text (see CLAUDE.md)\n'
    + '  3. Re-check the detector rule count against crates/foundation/src/registry.rs;\n'
    + '     the arbiter cites it in four places\n'
    + '  4. Diff hooks/hooks.json against the upstream plugin hooks.json. The 4.3 rewrite\n'
    + '     changed the hook command and the PostToolUse matcher; a future release may again\n'
    + '  5. npm run preflight\n'
  );
}

main();
