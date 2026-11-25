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
 *   - no concept page exists on disk without a catalog entry;
 *   - sources: every site, page, citation (refs), spec link and `system` resolves in
 *     assets/sources.js, every core library has foundations, and no page goes uncited.
 * URLs are not fetched here; `node scripts/check-links.mjs` does that.
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
for (const f of ['assets/catalog.js', 'assets/sources.js', 'assets/icons.js']) {
  vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const C = sandbox.window.CATALOG;
const S = sandbox.window.SOURCES;
const ICONS = sandbox.window.Icons.ICONS;

const problems = [];
const fail = msg => problems.push(msg);
let concepts = 0, tokens = 0;
const cited = new Set();   // page ids cited by any concept or category

/** Check a refs array ([pageId | pageId[], note]) and record what it cites. */
function checkRefs(where, refs, needNotes) {
  if (!refs?.length) return fail(`${where}: no refs (its Sources section would be empty)`);
  for (const [ids, note] of refs) {
    for (const id of [].concat(ids)) {
      if (!S.pages[id]) fail(`${where}: cites unknown page "${id}"`);
      cited.add(id);
    }
    if (needNotes && !note) fail(`${where}: citation of "${ids}" has no note on what it contributed`);
  }
}

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
    const catHtml = checkPage(`${dir}/index.html`, dir);
    if (catHtml && !/data-sources/.test(catHtml)) fail(`${dir}/index.html: no data-sources section`);
    checkRefs(dir, cat.refs, false);
    for (const [sys, id] of Object.entries(cat.specs ?? {})) {
      if (!S.systems[sys]) fail(`${dir}: specs names unknown core library "${sys}"`);
      if (!S.pages[id]) fail(`${dir}: specs points at unknown page "${id}"`);
      else if (S.pages[id].site !== sys) fail(`${dir}: specs.${sys} is a page from "${S.pages[id].site}"`);
      cited.add(id);
    }

    for (const k of list) {
      concepts++;
      for (const f of k.features ?? []) if (!C.FEATURES[f]) fail(`${dir}/${k.id}: unknown feature "${f}"`);
      if (!k.summary) fail(`${dir}/${k.id}: no summary`);
      const html = checkPage(`${dir}/${k.id}.html`, `${dir}/${k.id}`);
      if (!html) continue;
      if (!/data-demo="html"/.test(html)) fail(`${dir}/${k.id}: no data-demo="html" block`);
      if (!/data-demo="css"/.test(html)) fail(`${dir}/${k.id}: no data-demo="css" block`);
      if (!/data-sources/.test(html)) fail(`${dir}/${k.id}: no data-sources section`);
      checkRefs(`${dir}/${k.id}`, k.refs, true);
      if (k.system && !S.systems[k.system]) fail(`${dir}/${k.id}: system "${k.system}" is not a core library in sources.js`);
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

/* ---- Sources registry ---- */
const KINDS = new Set(['system', ...Object.keys(S.KINDS)]);
const https = u => /^https:\/\//.test(u ?? '');
for (const [id, site] of Object.entries(S.sites)) {
  if (!site.name || !https(site.url)) fail(`sources: site "${id}" needs a name and an https url`);
  if (!KINDS.has(site.kind)) fail(`sources: site "${id}" has unknown kind "${site.kind}"`);
  if (site.kind === 'system' && !S.systems[id]) fail(`sources: core library "${id}" has no systems entry`);
}
for (const [id, page] of Object.entries(S.pages)) {
  if (!S.sites[page.site]) fail(`sources: page "${id}" names unknown site "${page.site}"`);
  if (!page.title || !https(page.url)) fail(`sources: page "${id}" needs a title and an https url`);
  if (!cited.has(id)) fail(`sources: page "${id}" is not cited anywhere (cite it or remove it)`);
}
let foundations = 0;
for (const [id, sys] of Object.entries(S.systems)) {
  if (S.sites[id]?.kind !== 'system') fail(`sources: systems.${id} has no site of kind "system"`);
  for (const f of ['owner', 'version', 'platforms', 'summary', 'components']) if (!sys[f]) fail(`sources: systems.${id} has no ${f}`);
  if (!https(sys.tokens?.url)) fail(`sources: systems.${id}.tokens needs { label, url }`);
  for (const row of sys.foundations ?? []) {
    foundations++;
    if (row.length !== 4 || !https(row[3])) fail(`sources: systems.${id} row "${row[1]}" must be [group, label, value, https source]`);
    if (/UNVERIFIED/i.test(row[2])) fail(`sources: systems.${id} row "${row[1]}" is marked UNVERIFIED`);
  }
  if (!sys.foundations?.length) fail(`sources: systems.${id} has no foundations`);
}
checkPage('sources.html', 'sources');

if (problems.length) {
  console.log(problems.map(p => `✗ ${p}`).join('\n'));
  console.log(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`✓ ${concepts} concepts, ${tokens} documented tokens, ${Object.keys(S.pages).length} cited pages, ${Object.keys(S.systems).length} core libraries (${foundations} foundation rows); all files and icons accounted for.`);
