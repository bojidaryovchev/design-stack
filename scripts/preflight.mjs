#!/usr/bin/env node
/**
 * Engine preflight.
 *
 * impeccable 4.3.x runs a self-contained Rust binary. The launcher at
 * skills/impeccable/scripts/impeccable resolves it in order: $IMPECCABLE_BIN,
 * a sibling bin/<os>-<arch>/, ~/.impeccable/bin/<version>/, then PATH, and as a
 * last resort downloads the pinned version from GitHub releases and verifies it
 * against a .sha256 sidecar before running it.
 *
 * That download needs network and a writable cache. On a machine that has
 * neither, every detector hook fails, so this checks that the engine answers
 * its handshake and reports the version it answered with.
 *
 * Historical note: through 4.0.x the detector was JavaScript and the
 * static-HTML tier imported four npm parsers. With them missing it caught the
 * import error and silently fell back to regex, reporting zero findings and
 * exit 0, which reads as clean when it means not checked. The Rust engine has
 * no such tier split and no npm dependencies, so that failure mode is gone.
 *
 *   node scripts/preflight.mjs            human-readable
 *   node scripts/preflight.mjs --json     machine-readable
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL_DIR = path.join(ROOT, 'skills', 'impeccable');
const LAUNCHER = path.join(SKILL_DIR, 'scripts', process.platform === 'win32' ? 'impeccable.cmd' : 'impeccable');

function pinnedVersion() {
  try {
    return fs.readFileSync(path.join(SKILL_DIR, 'scripts', 'VERSION'), 'utf8').trim();
  } catch {
    return null;
  }
}

export function preflight() {
  const pinned = pinnedVersion();
  const skills = fs.existsSync(path.join(ROOT, 'skills'))
    ? fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, 'skills', e.name, 'SKILL.md')))
      .map((e) => e.name)
    : [];

  if (!fs.existsSync(LAUNCHER)) {
    return { pinned, skills, engine: { ok: false, reason: `launcher missing at ${path.relative(ROOT, LAUNCHER)}` } };
  }

  try {
    // A .cmd launcher is not directly executable by CreateProcess, so Windows
    // needs the shell. Quote the path: it can contain spaces.
    const win = process.platform === 'win32';
    const out = execFileSync(win ? `"${LAUNCHER}"` : LAUNCHER, ['engine-probe'], {
      cwd: ROOT, encoding: 'utf8', timeout: 120_000, stdio: ['ignore', 'pipe', 'pipe'], shell: win,
    }).trim();
    const version = out.startsWith('impeccable-engine') ? out.split(/\s+/)[1] : null;
    if (!version) return { pinned, skills, engine: { ok: false, reason: `unexpected handshake: ${out.slice(0, 80)}` } };
    return { pinned, skills, engine: { ok: true, version, matchesPinned: !pinned || version === pinned } };
  } catch (error) {
    const detail = (error?.stderr || error?.message || '').toString().trim().split('\n')[0];
    return { pinned, skills, engine: { ok: false, reason: detail || 'engine-probe failed' } };
  }
}

function render(r) {
  const lines = [];
  lines.push(`skills discoverable   ${r.skills.length} (${r.skills.join(', ') || 'none'})`);
  lines.push(`engine version pinned ${r.pinned || 'unknown'}`);
  if (r.engine.ok) {
    lines.push(`engine responding     yes, ${r.engine.version}`);
    if (!r.engine.matchesPinned) {
      lines.push('');
      lines.push(`WARNING: the engine answering is ${r.engine.version}, not the pinned ${r.pinned}.`);
      lines.push('Something earlier in the launcher search order is winning. Check $IMPECCABLE_BIN and PATH.');
    } else {
      lines.push('');
      lines.push('Ready. The detector hooks will run.');
    }
  } else {
    lines.push('engine responding     NO');
    lines.push('');
    lines.push(`The engine did not answer: ${r.engine.reason}`);
    lines.push('Every detector hook fails until it does. The launcher downloads the pinned');
    lines.push('version on first run, so this usually means no network or no writable cache.');
    lines.push('Set IMPECCABLE_BIN to a preinstalled binary, or IMPECCABLE_HOME to a writable path.');
  }
  return lines.join('\n');
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const report = preflight();
  process.stdout.write(process.argv.includes('--json')
    ? `${JSON.stringify(report, null, 2)}\n`
    : `${render(report)}\n`);
  process.exit(report.engine.ok && report.engine.matchesPinned ? 0 : 1);
}
