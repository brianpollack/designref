#!/usr/bin/env node
/**
 * check.mjs — consistency check for the library. Run after any change:
 *
 *   node scripts/check.mjs
 *
 * Verifies that
 *   - every researched category has <section>/<category>/index.html with a matching data-page;
 *   - every concept has its .html file with a matching data-page and demo blocks;
 *   - feature keys exist in CATALOG.FEATURES;
 *   - every #i-<name> icon a page uses exists in assets/icons.js;
 *   - no concept page exists on disk without a catalog entry.
 * Prints one line per problem and exits 1 if anything is wrong.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Load classic browser scripts that assign to window.* */
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['assets/catalog.js', 'assets/icons.js']) {
  vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const C = sandbox.window.CATALOG;
const ICONS = sandbox.window.Icons.ICONS;

const problems = [];
const fail = msg => problems.push(msg);
let concepts = 0, tokens = 0;

/** Read a page and check its data-page attribute and icon references. */
function checkPage(rel, expectedPage) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) return fail(`missing file ${rel}`), null;
  const html = readFileSync(path, 'utf8');
  const page = html.match(/<body[^>]*data-page="([^"]*)"/)?.[1];
  if (page !== expectedPage) fail(`${rel}: data-page is "${page}", expected "${expectedPage}"`);
  for (const [, name] of html.matchAll(/#i-([a-z0-9-]+)/g)) {
    if (!ICONS[name]) fail(`${rel}: icon "${name}" is not in assets/icons.js`);
  }
  return html;
}

for (const section of C.sections) {
  for (const cat of section.categories) {
    const list = cat.concepts ?? [];
    const dir = `${section.id}/${cat.id}`;
    if (!list.length) continue;
    if (!cat.summary) fail(`${dir}: researched category has no summary`);
    checkPage(`${dir}/index.html`, dir);

    for (const k of list) {
      concepts++;
      for (const f of k.features ?? []) if (!C.FEATURES[f]) fail(`${dir}/${k.id}: unknown feature "${f}"`);
      if (!k.summary) fail(`${dir}/${k.id}: no summary`);
      const html = checkPage(`${dir}/${k.id}.html`, `${dir}/${k.id}`);
      if (!html) continue;
      if (!/data-demo="html"/.test(html)) fail(`${dir}/${k.id}: no data-demo="html" block`);
      if (!/data-demo="css"/.test(html)) fail(`${dir}/${k.id}: no data-demo="css" block`);
      const documented = (html.match(/--[\w-]+\s*:[^;]+;[ \t]*\/\*/g) ?? []).length;
      if (!documented) fail(`${dir}/${k.id}: no documented tokens (spec table would be empty)`);
      tokens += documented;
    }

    // Pages on disk that the catalog doesn't know about.
    const known = new Set(['index.html', ...list.map(k => `${k.id}.html`)]);
    for (const f of readdirSync(join(ROOT, dir))) {
      if (f.endsWith('.html') && !known.has(f)) fail(`${dir}/${f}: not in assets/catalog.js`);
    }
  }
  // Category folders that exist but are not researched in the catalog.
  const secDir = join(ROOT, section.id);
  if (existsSync(secDir)) {
    for (const d of readdirSync(secDir)) {
      if (!statSync(join(secDir, d)).isDirectory()) continue;
      const cat = section.categories.find(c => c.id === d);
      if (!cat) fail(`${section.id}/${d}: folder has no catalog entry`);
    }
  }
}

if (problems.length) {
  console.log(problems.map(p => `✗ ${p}`).join('\n'));
  console.log(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`✓ ${concepts} concepts, ${tokens} documented tokens, all files and icons accounted for.`);
