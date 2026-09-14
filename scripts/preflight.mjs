#!/usr/bin/env node
/**
 * Detector tier preflight.
 *
 * The impeccable detector runs three engines and two of them degrade when
 * their dependencies are absent. The static-HTML engine degrades *silently*:
 * `detect-html.mjs` catches the failed import and falls back to the regex
 * engine, so a `.html` file with an oversized h1, destructive tracking and a
 * cream background reports zero findings and exit 0. That reads as "clean"
 * when it means "not checked".
 *
 * This module reports which tiers are actually live so the failure is visible.
 * It is the answer to the stack's own warning that a clean hook result is not
 * a clean bill of health.
 *
 *   node scripts/preflight.mjs            human-readable
 *   node scripts/preflight.mjs --json     machine-readable
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';

const STATIC_HTML_DEPS = ['htmlparser2', 'css-select', 'css-tree', 'domutils'];

async function canImport(specifier) {
  try {
    await import(specifier);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve tier availability from the plugin root's own module graph.
 * Imports are attempted from this file, so they resolve against the plugin's
 * node_modules exactly as the detector's own imports do.
 */
export async function preflight() {
  const staticResults = await Promise.all(
    STATIC_HTML_DEPS.map(async (dep) => [dep, await canImport(dep)])
  );
  const missingStatic = staticResults.filter(([, ok]) => !ok).map(([dep]) => dep);
  const browser = await canImport('puppeteer');

  return {
    regex: { live: true, needs: [], catches: 'literal patterns in any source file' },
    staticHtml: {
      live: missingStatic.length === 0,
      needs: missingStatic,
      catches: 'cascade-resolved rules on .html files: oversized-h1, extreme-negative-tracking, cream-palette, cramped-padding, icon-tile-stack and more',
    },
    browser: {
      live: browser,
      needs: browser ? [] : ['puppeteer'],
      catches: 'structural and computed rules, rendered URLs only: nested-cards, tiny-text, low-contrast, text-occlusion',
    },
  };
}

export function summarize(report) {
  const down = [];
  if (!report.staticHtml.live) down.push('static-HTML');
  if (!report.browser.live) down.push('browser');
  return { down, allLive: down.length === 0 };
}

function render(report) {
  const rows = [
    ['regex', report.regex],
    ['static-HTML', report.staticHtml],
    ['browser + visual', report.browser],
  ];
  const lines = ['Design-stack detector tiers:', ''];
  for (const [name, tier] of rows) {
    const mark = tier.live ? 'live' : `DOWN (missing ${tier.needs.join(', ')})`;
    lines.push(`  ${name.padEnd(18)} ${mark}`);
    lines.push(`  ${' '.repeat(18)} ${tier.catches}`);
    lines.push('');
  }
  const { allLive } = summarize(report);
  lines.push(
    allLive
      ? 'All tiers live. A clean scan of a rendered URL is a real clean result.'
      : 'Run `npm install` in the plugin root. Until then the missing tiers report zero findings without saying they were skipped.'
  );
  return lines.join('\n');
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const report = await preflight();
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(`${render(report)}\n`);
  }
  process.exit(summarize(report).allLive ? 0 : 1);
}
