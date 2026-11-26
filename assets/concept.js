/**
 * concept.js — demo harness for concept pages.
 *
 * A concept page holds its demo as plain source blocks; this script turns them into
 * live previews (light and dark side by side), a code viewer, and a spec table whose
 * values are read from the running demo, so specs can never drift from code.
 *
 * Authoring contract (see _scaffold/concept.html):
 *   <script type="text/plain" data-demo="html"> markup </script>
 *   <style data-demo="css" media="not all"> CSS </style>        media="not all": inert on this page
 *   <script type="text/plain" data-demo="js"> script </script>   optional
 *   <script type="text/plain" data-demo="pin"> script </script>  optional: puts the demo in its
 *       "open at rest" state after load (e.g. dispatch a contextmenu event). Not shown as code.
 *
 *   <section data-preview data-height="440" data-hint="Right-click a file">  → frames + toolbar
 *   <section data-spec><h2>Specs</h2></section>                            → token table, then
 *       the credit for the demo's icon library (catalog `icons`, default Lucide)
 *   <section data-code><h2>Code</h2></section>                             → tabs + copy
 *
 * Token convention (demo CSS): tokens on :root with a trailing comment become spec rows.
 *   :root {
 *     /* @group Container *\/
 *     --menu-bg: light-dark(#fff, #232428);   /* Surface *\/
 *   }
 * Tokens without a trailing comment are treated as internal and skipped.
 *
 * Thumb mode (concept.html#thumb or #thumb-dark): renders one frame full-viewport for the
 * category page and posts { type: 'concept-stats', id, jsLines } to the parent.
 */
(function () {
  'use strict';

  /** Minimal page reset injected into every demo; shown under the code viewer. */
  const DEMO_BASE = `*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
button, input { font: inherit; color: inherit; }
svg.icon { width: 16px; height: 16px; flex: none; }`;

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  /** Remove the common indentation and surrounding blank lines of an authored block. */
  function dedent(text = '') {
    const lines = text.replace(/\r/g, '').replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    const indents = lines.filter(l => l.trim()).map(l => l.match(/^[ \t]*/)[0].length);
    const cut = indents.length ? Math.min(...indents) : 0;
    return lines.map(l => l.slice(cut)).join('\n');
  }

  const block = name => {
    const el = $(`[data-demo="${name}"]`);
    return el ? dedent(el.textContent) : '';
  };

  /** Demo sources; read in boot() because this script runs before <body> is parsed. */
  let src = { html: '', css: '', js: '', pin: '' };
  const title = () => Site.here.concept?.title ?? document.title;
  /** The concept's icon library (catalog `icons`, default Lucide) and its registry entry. */
  const iconSet = () => Site.here.concept?.icons ?? 'lucide';
  const iconLib = () => window.ICON_LIBRARIES.libraries[iconSet()];

  /* ---- Document assembly --------------------------------------------------- */

  /**
   * Build a complete HTML document for the demo.
   * @param {object} o
   * @param {'light'|'dark'} [o.scheme]  Forces color-scheme; omitted = follow the OS.
   * @param {boolean} [o.pin=true]       Include the "open at rest" script.
   * @param {boolean} [o.inert=false]    Thumbnails: an inert <body> can't take focus, so
   *                                     autofocus, focus() and showModal() can't steal focus
   *                                     or scroll the category page. Popovers still render.
   */
  function buildDoc({ scheme, pin = true, inert = false } = {}) {
    const forced = scheme ? ` style="color-scheme: ${scheme}"` : '';
    const sprite = Icons.spriteFor(src.html, iconSet());
    return [
      '<!doctype html>',
      `<html lang="en"${forced}>`,
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${esc(title())}</title>`,
      `<style>\n${DEMO_BASE}\n</style>`,
      `<style>\n${src.css}\n</style>`,
      '</head>',
      inert ? '<body inert>' : '<body>',
      sprite,
      src.html,
      src.js ? `<script>\n${src.js}\n</script>` : '',
      pin && src.pin ? `<script>\n${src.pin}\n</script>` : '',
      '</body>',
      '</html>',
    ].filter(Boolean).join('\n');
  }

  /** Lines of real JavaScript: no blanks, no comment-only lines. */
  function countJs(js) {
    if (!js) return 0;
    return js.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
      .filter(l => l.trim() && !/^\s*\/\//.test(l)).length;
  }

  /* ---- Preview ------------------------------------------------------------- */

  let frames = [];

  /** Load (or reload) the frames; resolves with their windows once loaded. */
  function loadFrames() {
    return Promise.all(frames.map(f => new Promise(resolve => {
      f.addEventListener('load', () => resolve(f.contentWindow), { once: true });
      f.srcdoc = buildDoc({ scheme: f.dataset.scheme, inert: document.documentElement.classList.contains('thumb') });
    })));
  }

  function renderPreview(section, schemes) {
    section.style.setProperty('--frame-h', `${section.dataset.height || 440}px`);
    const figures = schemes.map(s => `
      <figure><figcaption>${s === 'light' ? 'Light' : 'Dark'}</figcaption>
        <iframe data-scheme="${s}" title="${esc(title())}, ${s} theme"></iframe></figure>`).join('');
    section.innerHTML = `
      <div class="preview-bar">
        <span class="hint">${esc(section.dataset.hint || '')}</span>
        <button class="ghost" data-act="reset">${Icons.svg('rotate-ccw')}Reset</button>
        <button class="ghost" data-act="open">${Icons.svg('external-link')}Open standalone</button>
      </div>
      <div class="preview">${figures}</div>`;
    frames = [...section.querySelectorAll('iframe')];

    section.querySelector('.preview-bar').addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'reset') loadFrames();
      if (act === 'open') {
        const blob = new Blob([buildDoc({ pin: false })], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
      }
    });
    return loadFrames();
  }

  /* ---- Code viewer --------------------------------------------------------- */

  /**
   * Tiny highlighter: comments, strings, keywords/at-rules, tags/custom properties.
   * Each language regex uses capture groups in the order given by its class list.
   */
  const SYNTAX = {
    css: { re: /(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(@[\w-]+)|(--[\w-]+)/g, cls: ['c', 's', 'k', 't'] },
    js: {
      re: /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(const|let|var|function|return|if|else|for|of|in|new|class|await|async|this|null|true|false|undefined|break|continue|switch|case|default|typeof|try|catch|throw|while)\b/g,
      cls: ['c', 's', 'k'],
    },
    html: { re: /(<!--[\s\S]*?-->)|("[^"\n]*")|(<\/?[\w-]+|\/?>)/g, cls: ['c', 's', 't'] },
  };

  function highlight(code, lang) {
    const { re, cls } = SYNTAX[lang];
    let out = '', last = 0;
    for (const m of code.matchAll(re)) {
      const g = m.slice(1).findIndex(Boolean);
      out += esc(code.slice(last, m.index)) + `<span class="${cls[g]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last));
  }

  function renderCode(section) {
    const tabs = [['html', 'HTML'], ['css', 'CSS'], ['js', 'JavaScript']].filter(([k]) => src[k]);
    const bar = document.createElement('div');
    bar.className = 'code-bar';
    bar.innerHTML = `
      <div role="tablist" aria-label="Source">${tabs.map(([k, label], i) => `
        <button class="ghost" role="tab" id="tab-${k}" data-lang="${k}" aria-selected="${i === 0}" aria-controls="code-panel" tabindex="${i ? -1 : 0}">${label}</button>`).join('')}
      </div>
      <button class="ghost" data-act="copy">${Icons.svg('copy')}Copy</button>
      <button class="ghost" data-act="copy-file">${Icons.svg('file')}Copy as one file</button>`;
    const panel = document.createElement('pre');
    panel.className = 'code-panel';
    panel.id = 'code-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
    const note = document.createElement('p');
    note.className = 'code-note';
    const icons = `Icons are from ${iconLib().name}, in an inline SVG sprite`;
    note.textContent = src.js
      ? `${icons}. “Copy as one file” includes the sprite and base styles.`
      : `No JavaScript: everything above is HTML attributes and CSS. ${icons}; “Copy as one file” includes it.`;
    const base = document.createElement('details');
    base.className = 'base';
    base.innerHTML = `<summary>Base styles every demo shares</summary><pre class="code-panel"><code>${highlight(DEMO_BASE, 'css')}</code></pre>`;
    section.append(bar, panel, note, base);

    let lang = tabs[0][0];
    const show = k => {
      lang = k;
      panel.innerHTML = `<code>${highlight(src[k], k)}</code>`;
      bar.querySelectorAll('[role="tab"]').forEach(t => {
        const on = t.dataset.lang === k;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', `tab-${k}`);
    };
    show(lang);

    bar.addEventListener('click', e => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) return show(tab.dataset.lang);
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'copy') Site.copy(src[lang], `Copied ${lang.toUpperCase()}`);
      if (act === 'copy-file') Site.copy(buildDoc({ pin: false }), 'Copied single HTML file');
    });
    // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
    bar.querySelector('[role="tablist"]').addEventListener('keydown', e => {
      const i = tabs.findIndex(([k]) => k === lang);
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length][0];
      show(next);
      bar.querySelector(`[data-lang="${next}"]`).focus();
    });
  }

  /* ---- Spec table ---------------------------------------------------------- */

  /** Bodies of every top-level `:root { … }` rule, found by brace matching. */
  function rootBodies(css) {
    const bodies = [];
    const re = /(^|[}\s]):root\s*\{/g;
    let m;
    while ((m = re.exec(css))) {
      let depth = 1, i = re.lastIndex;
      for (; i < css.length && depth; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0;
      bodies.push(css.slice(re.lastIndex, i - 1));
      re.lastIndex = i;
    }
    return bodies;
  }

  /** Documented tokens: [{ group, name, desc }] in source order. */
  function parseTokens(css) {
    const out = [];
    for (const body of rootBodies(css)) {
      let group = 'Tokens', i = 0;
      while (i < body.length) {
        if (/\s/.test(body[i])) { i++; continue; }
        if (body.startsWith('/*', i)) {
          const end = body.indexOf('*/', i + 2);
          const g = body.slice(i + 2, end).trim().match(/^@group\s+(.+)$/);
          if (g) group = g[1];
          i = end + 2;
          continue;
        }
        let depth = 0, j = i;
        for (; j < body.length; j++) {
          if (body[j] === '(') depth++;
          else if (body[j] === ')') depth--;
          else if (body[j] === ';' && !depth) break;
        }
        const decl = body.slice(i, j).trim();
        i = j + 1;
        const note = body.slice(i).match(/^[ \t]*\/\*([\s\S]*?)\*\//);
        if (note) i += note[0].length;
        const d = decl.match(/^(--[\w-]+)\s*:/);
        if (d && note) out.push({ group, name: d[1], desc: note[1].trim() });
      }
    }
    return out;
  }

  /** Split a CSS list on top-level commas (ignores commas inside parentheses). */
  function splitTop(value) {
    const parts = [];
    let depth = 0, start = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '(') depth++;
      else if (value[i] === ')') depth--;
      else if (value[i] === ',' && !depth) { parts.push(value.slice(start, i).trim()); start = i + 1; }
    }
    parts.push(value.slice(start).trim());
    return parts;
  }

  /** For `light-dark(a, b)` return the branch that applies to `scheme`. */
  function branch(raw, scheme) {
    const m = raw.match(/^light-dark\(([\s\S]*)\)$/);
    if (!m) return raw;
    const [a, b] = splitTop(m[1]);
    return scheme === 'dark' ? b : a;
  }

  const hex2 = n => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  const nums = s => (s.match(/-?[\d.]+/g) || []).map(Number);

  /**
   * Resolve any CSS color expression to sRGB hex + alpha inside a frame. Relative color
   * syntax converts from whatever space the color is in (oklab, color-mix, light-dark…);
   * Chrome serializes the result as `color(srgb r g b / a)` with 0–1 channels.
   */
  function readColor(win, probe, expr) {
    probe.style.color = `color(from ${expr} srgb r g b / alpha)`;
    const [r, g, b, a = 1] = nums(win.getComputedStyle(probe).color);
    const hex = `#${hex2(r * 255)}${hex2(g * 255)}${hex2(b * 255)}`.toUpperCase();
    return { hex, alpha: Math.round(a * 100) };
  }

  /** Resolve one token in one frame into a display model. */
  function resolve(win, scheme, name) {
    const doc = win.document;
    const raw = win.getComputedStyle(doc.documentElement).getPropertyValue(name).trim();
    const shown = branch(raw, scheme);
    const probe = doc.createElement('i');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    doc.body.append(probe);
    try {
      if (CSS.supports('color', raw)) {
        const c = readColor(win, probe, `var(${name})`);
        const plain = /^#[0-9a-f]{3,8}$/i.test(shown);
        return { kind: 'color', key: `${c.hex}/${c.alpha}`, ...c, raw: plain ? '' : shown };
      }
      if (/shadow/.test(name) && CSS.supports('box-shadow', raw)) {
        probe.style.boxShadow = `var(${name})`;
        const computed = win.getComputedStyle(probe).boxShadow;
        const layers = computed === 'none' ? [] : splitTop(computed).map(layer => {
          const color = layer.match(/(?:rgba?|color|oklab|oklch|lab|lch|hsla?)\([^)]*\)|#[0-9a-f]+/i)?.[0] ?? 'transparent';
          const lens = nums(layer.replace(color, '')).join(' ');
          return { lens, inset: /inset/.test(layer), ...readColor(win, probe, color) };
        });
        return { kind: 'shadow', key: JSON.stringify(layers), layers };
      }
      if (/(rem|em|calc\()/.test(raw) && CSS.supports('width', raw)) {
        probe.style.width = `var(${name})`;
        const px = win.getComputedStyle(probe).width;
        return { kind: 'value', key: raw, text: shown, extra: px };
      }
      return { kind: 'value', key: shown, text: shown };
    } finally {
      probe.remove();
    }
  }

  const swatch = (hex, alpha) =>
    `<span class="swatch"><i style="background:${hex}${alpha < 100 ? hex2(alpha * 2.55) : ''}"></i></span>`;

  function cell(v) {
    if (v.kind === 'color') {
      return `${swatch(v.hex, v.alpha)}${v.hex}${v.alpha < 100 ? ` · ${v.alpha}%` : ''}${v.raw ? `<span class="raw">${esc(v.raw)}</span>` : ''}`;
    }
    if (v.kind === 'shadow') {
      if (!v.layers.length) return 'none';
      return v.layers.map(l => `<div class="layer">${swatch(l.hex, l.alpha)}${l.inset ? 'inset ' : ''}${l.lens} · ${l.hex} ${l.alpha}%</div>`).join('');
    }
    return `${esc(v.text)}${v.extra && v.extra !== v.text ? `<span class="raw">= ${esc(v.extra)}</span>` : ''}`;
  }

  /** Inline `code` in token descriptions. */
  const descHtml = d => esc(d).replace(/`([^`]+)`/g, '<code>$1</code>');

  /** Credit for the demo's icons, shown at the end of Specs (just above Behavior). */
  function iconCredit() {
    const id = iconSet(), lib = iconLib();
    return `<p class="icon-credit">Icons used in this page are from <a href="${lib.url}">${esc(lib.name)}</a> (${esc(lib.license)}). `
      + `More information on our <a href="${Site.url('icons.html')}#${id}">icon library page</a>.</p>`;
  }

  function renderSpec(section, wins) {
    const tokens = parseTokens(src.css);
    if (!tokens.length) { section.innerHTML = iconCredit(); return; }
    const [light, dark] = wins;
    let group = null, rows = '';
    for (const t of tokens) {
      if (t.group !== group) {
        group = t.group;
        rows += `<tr class="group"><th colspan="3">${esc(group)}</th></tr>`;
      }
      const a = resolve(light, 'light', t.name), b = resolve(dark, 'dark', t.name);
      const values = a.key === b.key
        ? `<td class="val" colspan="2">${cell(a)}</td>`
        : `<td class="val">${cell(a)}</td><td class="val">${cell(b)}</td>`;
      rows += `<tr><td><span class="tk-desc">${descHtml(t.desc)}</span><code class="tk-name">${t.name}</code></td>${values}</tr>`;
    }
    section.insertAdjacentHTML('beforeend', `
      <table class="spec">
        <thead><tr><th>Token</th><th>Light</th><th>Dark</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="spec-note">Read live from the demo’s CSS custom properties in each theme. Colors are sRGB hex with opacity; shadows read x y blur spread.</p>
      ${iconCredit()}`);
  }

  /* ---- Rules check ---------------------------------------------------------- */

  /** Load a classic script on demand (works from file://). */
  const loadScript = url => new Promise((ok, no) => {
    const el = document.createElement('script');
    el.src = url; el.onload = ok; el.onerror = no;
    document.head.append(el);
  });

  const STATE = { true: ['pass', 'Pass'], false: ['fail', 'Fail'], review: ['review', 'Review'] };

  /**
   * Run every rule in both frames and render the table after Specs. Only pages built to (or inspired
   * by) a core library get one. A rule's state is its worst result across the two themes; a rule with
   * no check is "Review by hand". See assets/rules.js for what each rule measures.
   */
  async function renderRules(specEl, wins) {
    const concept = Site.here.concept;
    if (!concept?.system) return;
    if (!window.RULES) await loadScript(Site.url('assets/rules.js'));
    const R = window.RULES, system = window.SOURCES.sites[concept.system];
    const rules = [...R.universal, ...(R.systems[concept.system] ?? [])];
    const host = document.createElement('section');
    host.className = 'ruled rules'; host.dataset.rules = '';
    specEl.after(host);

    const run = () => {
      const rank = { true: 0, review: 1, false: 2 };
      let counts = { pass: 0, fail: 0, review: 0, manual: 0 };
      const rows = rules.map(rule => {
        const page = window.SOURCES.pages[rule.source];
        let results = [];
        if (rule.check) {
          results = wins.map((w, i) => {
            try { return rule.check(R.makeContext(w, ['light', 'dark'][i], concept)); }
            catch (e) { return { pass: 'review', detail: `check failed: ${e.message}` }; }
          });
        }
        const worst = results.length ? results.reduce((a, b) => rank[b.pass] > rank[a.pass] ? b : a).pass : null;
        const [cls, word] = worst === null ? ['manual', 'Review by hand'] : STATE[worst];
        counts[worst === null ? 'manual' : cls]++;
        // Say which theme a problem is in only when the two differ.
        const same = results.length > 1 && results[0].detail === results[1].detail;
        const detail = results.map((r, i) => `${same && i ? '' : `${results.length > 1 && !same ? ['Light', 'Dark'][i] + ': ' : ''}${esc(r.detail ?? '')}`}`).filter(Boolean).join(' · ');
        const items = [...new Set(results.flatMap(r => r.items ?? []))].slice(0, 5);
        return `<tr class="rule-${cls}"><td class="state"><span>${word}</span></td>
          <td>${esc(rule.text)}<span class="raw">${detail}${items.length ? ` — ${items.map(esc).join('; ')}${results.some(r => (r.items?.length ?? 0) > 5) ? '…' : ''}` : ''}</span></td>
          <td class="src"><a href="${page.url}">${esc(page.title)}</a></td></tr>`;
      }).join('');
      const measured = counts.pass + counts.fail + counts.review;
      host.innerHTML = `
        <h2>Rules check</h2>
        <p class="rules-summary">${counts.pass} of ${measured} measurable rules pass${counts.fail ? `, <strong>${counts.fail} fail</strong>` : ''}${counts.review ? `, ${counts.review} to review` : ''}; ${counts.manual} more are for a person.
          <button class="ghost" data-act="rules">Run again</button></p>
        <table class="kv rules-table"><thead><tr><th>Result</th><th>Rule</th><th>From</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="spec-note">Measured in the demo above, in both themes, with ${esc(system.short ?? system.name)} and WCAG 2.2 rules.
          A pass means the rule held in this demo as drawn; it does not mean the page meets ${esc(system.short ?? system.name)}, which also asks for judgment no script can make.
          ${concept.inspired ? `This page is inspired by ${esc(system.short ?? system.name)}, not built to it, so read the results as information.` : ''}
          ${concept.platform ? `Sizes use ${esc(concept.platform)} thresholds, with 1pt taken as 1 CSS px.` : ''}</p>`;
    };
    run();
    host.addEventListener('click', e => { if (e.target.closest('[data-act="rules"]')) run(); });
  }

  /* ---- Boot ---------------------------------------------------------------- */

  function boot() {
    src = { html: block('html'), css: block('css'), js: block('js'), pin: block('pin') };
    const jsLines = countJs(src.js);
    const previewEl = $('[data-preview]');

    if (document.documentElement.classList.contains('thumb')) {
      if (previewEl) renderPreview(previewEl, [location.hash === '#thumb-dark' ? 'dark' : 'light']);
      parent.postMessage({ type: 'concept-stats', id: Site.here.concept?.id, jsLines }, '*');
      return;
    }

    document.querySelectorAll('[data-js-lines]').forEach(el => { el.textContent = Site.jsLabel(jsLines); });
    const codeEl = $('[data-code]');
    if (codeEl) renderCode(codeEl);
    if (previewEl) {
      const ready = renderPreview(previewEl, ['light', 'dark']);
      const specEl = $('[data-spec]');
      if (specEl) ready.then(wins => { renderSpec(specEl, wins); renderRules(specEl, wins); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
