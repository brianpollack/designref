#!/usr/bin/env node
/**
 * check-links.mjs — fetch every external URL the library cites and report the dead or moved ones.
 *
 *   node scripts/check-links.mjs           all URLs
 *   node scripts/check-links.mjs mdn       only URLs containing "mdn"
 *
 * Collects URLs from assets/sources.js (sites, pages, core-library foundations and notes)
 * the FEATURES glossary in assets/catalog.js, and the icon libraries in
 * assets/icon-libraries.js. Prints one line per URL as results arrive,
 * then a summary. Exits 1 if any URL failed.
 *
 *   ✓  200 at the cited URL
 *   →  works, but redirects to a different URL (update the citation)
 *   ✗  error status, timeout or network failure
 *   ?  a host in BOT_CHECKED answered with an error; it serves a browser check to scripts,
 *      so open it by hand (does not fail the run)
 *   ~  still rate limited (429/503) after retries, common with GitHub; run again later
 *      (does not fail the run)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONCURRENCY = 6;      // parallel requests; kind to the sites we cite
const TIMEOUT_MS = 20000;   // per request
/** Hosts that show scripts a "checking your browser" page (403) but load in a browser. */
const BOT_CHECKED = ['bjk5.com'];

/** Load the classic browser scripts that hold the data. */
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['assets/catalog.js', 'assets/sources.js', 'assets/icon-libraries.js']) {
  vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const C = sandbox.window.CATALOG, S = sandbox.window.SOURCES;

/** Every cited URL, without its #fragment, once. */
const urls = new Set();
const add = u => u && urls.add(u.split('#')[0]);
Object.values(S.sites).forEach(s => add(s.url));
Object.values(S.pages).forEach(p => add(p.url));
for (const sys of Object.values(S.systems)) {
  add(sys.tokens?.url); add(sys.components);
  sys.foundations.forEach(row => add(row[3]));
  (sys.notes ?? []).forEach(([, src]) => add(src));
}
Object.values(C.FEATURES).forEach(f => add(f.url));
Object.values(sandbox.window.ICON_LIBRARIES.libraries).forEach(l => { add(l.url); add(l.licenseUrl); add(l.docs); });

const filter = process.argv[2];
const list = [...urls].filter(u => !filter || u.includes(filter)).sort();

const RETRIES = 3;          // for rate-limited answers (429, 503), with a growing pause
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** GET the URL (some servers reject HEAD), following redirects. */
async function probe(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'Mozilla/5.0 (link check)', accept: 'text/html,*/*' },
    });
    res.body?.cancel();
    // Compare without query or trailing slash: Google sites add a random ?hl= locale for bots.
    const bare = u => { const x = new URL(u); return x.origin + x.pathname.replace(/\/$/, ''); };
    const moved = bare(res.url) !== bare(url);
    if (res.status === 429 || res.status === 503) {
      if (attempt <= RETRIES) { await sleep(attempt * 4000); return probe(url, attempt + 1); }
      return { mark: '~', detail: `${res.status} rate limited` };
    }
    if (!res.ok) return { mark: BOT_CHECKED.includes(new URL(url).hostname) ? '?' : '✗', detail: `${res.status}` };
    return moved ? { mark: '→', detail: res.url } : { mark: '✓', detail: '' };
  } catch (e) {
    return { mark: '✗', detail: e.name === 'TimeoutError' ? 'timeout' : e.cause?.code ?? e.message };
  }
}

let done = 0;
const results = [];
const queue = [...list];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const r = await probe(url);
    results.push({ url, ...r });
    done++;
    console.log(`[${String(done).padStart(String(list.length).length)}/${list.length}] ${r.mark} ${url}${r.detail ? `  ${r.detail}` : ''}`);
  }
}
console.log(`Checking ${list.length} URLs…`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const failed = results.filter(r => r.mark === '✗');
const moved = results.filter(r => r.mark === '→');
const manual = results.filter(r => r.mark === '?');
const limited = results.filter(r => r.mark === '~');
console.log(`\n${results.length - failed.length - moved.length - manual.length - limited.length} ok, ${moved.length} redirected, ${failed.length} failed, ${manual.length} to open by hand, ${limited.length} rate limited.`);
if (limited.length) console.log(`\nRate limited (run again later): ${limited.length} URL(s) on ${[...new Set(limited.map(r => new URL(r.url).hostname))].join(', ')}`);
if (manual.length) console.log('\nOpen by hand (bot check):\n' + manual.map(r => `  ${r.url}`).join('\n'));
if (moved.length) console.log('\nRedirected (consider updating):\n' + moved.map(r => `  ${r.url}\n    → ${r.detail}`).join('\n'));
if (failed.length) console.log('\nFailed:\n' + failed.map(r => `  ${r.url}  ${r.detail}`).join('\n'));
process.exit(failed.length ? 1 : 0);
