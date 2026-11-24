/**
 * site.js — builds the shared chrome around every page from window.CATALOG.
 *
 * Include it in <head> (classic, not deferred) after catalog.js and icons.js:
 * the theme is applied before first paint, the shell is built on DOMContentLoaded.
 *
 * A page declares where it lives with <body data-page="…">:
 *   ""                                        home (index.html)
 *   "components/context-menus"                category page
 *   "components/context-menus/right-click-menu"  concept page
 *
 * What it renders
 *   - Left sidebar: brand, filter box ("/" focuses it), nav tree, theme switch.
 *   - Splitter between sidebar and main: drag, arrow keys, double-click resets.
 *     Width persists in localStorage (all file:// pages share one storage).
 *   - <header class="page-header" data-auto>: title, summary, meta line.
 *   - [data-catalog]  home listing of every section and category.
 *   - [data-concepts] category listing with live thumbnails.
 *   - Prev/next pager at the end of concept pages.
 *
 * Exposes window.Site for concept.js: { ROOT, url, here, store, copy, toast }.
 */
(function () {
  'use strict';

  const C = window.CATALOG;
  const ROOT = new URL('..', document.currentScript.src);   // assets/ lives one level below root
  const html = document.documentElement;

  /** localStorage wrapper: storage can be unavailable (private mode, policies). */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  };

  /* ---- Before first paint -------------------------------------------------- */

  // Thumb mode: a concept page embedded as a category thumbnail (see concept.js).
  if (/^#thumb/.test(location.hash)) html.classList.add('thumb');

  /** Theme preference: 'auto' follows the OS; 'light'/'dark' force it. */
  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') html.dataset.theme = theme;
    else delete html.dataset.theme;
  }
  applyTheme(store.get('theme'));

  const savedWidth = Number(store.get('nav-width'));
  if (savedWidth) html.style.setProperty('--nav-w', `${savedWidth}px`);

  /* ---- Catalog helpers ----------------------------------------------------- */

  const url = (...parts) => new URL(parts.join('/'), ROOT).href;
  const categoryUrl = (s, c) => url(s.id, c.id, 'index.html');
  const conceptUrl = (s, c, k) => url(s.id, c.id, `${k.id}.html`);
  const isResearched = c => (c.concepts?.length ?? 0) > 0;
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  /** Resolve a data-page id into its section / category / concept objects. */
  function locate(pageId = '') {
    const [s, c, k] = pageId.split('/');
    const section = C.sections.find(x => x.id === s);
    const category = section?.categories.find(x => x.id === c);
    const concept = category?.concepts?.find(x => x.id === k);
    return { section, category, concept };
  }

  /** The current page's catalog entries; filled in boot() once <body> exists. */
  let here = {};

  /** Is the page currently rendered dark? Used to pick thumbnail variants. */
  const isDark = () => matchMedia('(prefers-color-scheme: dark)').matches
    ? html.dataset.theme !== 'light'
    : html.dataset.theme === 'dark';

  /* ---- Copy + toast (shared with concept.js) -------------------------------- */

  let toastEl;
  function toast(message) {
    toastEl ??= Object.assign(document.body.appendChild(document.createElement('div')), { className: 'copied', role: 'status' });
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  async function copy(text, message = 'Copied') {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can be refused; fall back to a hidden textarea.
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(message);
  }

  /* ---- Sidebar ------------------------------------------------------------- */

  /**
   * Render the nav tree. Researched categories are links; planned ones collapse into one
   * "Planned" disclosure per section (the home page is where the full plan is read).
   * With a filter query, every matching entry is shown and matching planned ones open.
   */
  function renderTree(container, query = '') {
    const q = query.trim().toLowerCase();
    const match = text => !q || text.toLowerCase().includes(q);
    let out = '';

    for (const section of C.sections) {
      let items = '';
      const planned = [];
      for (const cat of section.categories) {
        const concepts = (cat.concepts ?? []).filter(k => match(k.title) || match(cat.title));
        if (!match(cat.title) && !concepts.length) continue;

        if (!isResearched(cat)) {
          planned.push(cat.title);
          continue;
        }
        const current = here.category === cat;
        const catCurrent = current && !here.concept ? ' aria-current="page"' : '';
        let sub = '';
        if (current || q) {
          sub = '<ul>' + concepts.map(k => {
            const kc = here.concept === k ? ' aria-current="page"' : '';
            return `<li><a href="${conceptUrl(section, cat, k)}"${kc}>${esc(k.title)}</a></li>`;
          }).join('') + '</ul>';
        }
        items += `<li><a href="${categoryUrl(section, cat)}"${catCurrent}>${esc(cat.title)}<span class="count">${cat.concepts.length}</span></a>${sub}</li>`;
      }
      const plannedHtml = planned.length ? `
        <details class="planned-group"${q ? ' open' : ''}>
          <summary>${Icons.svg('chevron-right', 'icon chev')}Planned <span class="count">${planned.length}</span></summary>
          <ul>${planned.map(t => `<li><span class="planned">${esc(t)}</span></li>`).join('')}</ul>
        </details>` : '';
      if (items || plannedHtml) out += `<h2>${esc(section.title)}</h2>${items ? `<ul>${items}</ul>` : ''}${plannedHtml}`;
    }
    container.innerHTML = out || '<p class="muted" style="padding:12px 8px;font-size:13px">No matches</p>';
  }

  function buildSidebar() {
    const nav = document.createElement('nav');
    nav.className = 'sidebar';
    nav.id = 'sidebar';
    nav.setAttribute('aria-label', 'Library');
    // .nav-body holds everything but the brand; on narrow screens it folds behind
    // the menu button so the page title and demo reach the first viewport.
    nav.innerHTML = `
      <div class="sidebar-head">
        <a class="brand" href="${url('index.html')}">${esc(C.title)}</a>
        <button class="ghost nav-toggle" aria-expanded="false" aria-controls="nav-body" aria-label="Library menu">${Icons.svg('menu')}</button>
      </div>
      <div class="nav-body" id="nav-body">
        <div class="nav-search">
          <input class="nav-filter" type="search" placeholder="Filter" aria-label="Filter the library (press /)" autocomplete="off">
        </div>
        <div class="nav-tree"></div>
        <div class="sidebar-foot" role="group" aria-label="Theme">
          <button class="ghost" data-theme-set="light" aria-label="Light theme" title="Light">${Icons.svg('sun')}</button>
          <button class="ghost" data-theme-set="dark" aria-label="Dark theme" title="Dark">${Icons.svg('moon')}</button>
          <button class="ghost" data-theme-set="auto" aria-label="Match system theme" title="System">${Icons.svg('monitor')}</button>
        </div>
      </div>`;

    const toggle = nav.querySelector('.nav-toggle');
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));

    const tree = nav.querySelector('.nav-tree');
    const filter = nav.querySelector('.nav-filter');
    renderTree(tree);
    filter.addEventListener('input', () => renderTree(tree, filter.value));
    filter.addEventListener('keydown', e => { if (e.key === 'Escape') { filter.value = ''; renderTree(tree); } });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.target.closest('input, textarea, [contenteditable]')) { e.preventDefault(); filter.focus(); }
    });

    // Theme switch: aria-pressed mirrors the stored preference.
    const syncTheme = () => {
      const current = store.get('theme') || 'auto';
      nav.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === current)));
    };
    nav.querySelector('.sidebar-foot').addEventListener('click', e => {
      const b = e.target.closest('[data-theme-set]');
      if (!b) return;
      store.set('theme', b.dataset.themeSet);
      // The chrome's one authored motion: a cross-fade between themes.
      const swap = () => { applyTheme(b.dataset.themeSet); syncTheme(); };
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(swap);
      else swap();
      document.dispatchEvent(new CustomEvent('site:theme'));
    });
    syncTheme();

    // Keep the current page's entry in view in a long tree.
    requestAnimationFrame(() => tree.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' }));
    return nav;
  }

  /**
   * Splitter between sidebar and main (WAI-ARIA window splitter pattern).
   * Pointer drag, ←/→ in 16px steps, Home/End for min/max, double-click resets.
   */
  function buildSplitter() {
    const MIN = 200, MAX = 480, DEFAULT = 264, STEP = 16;
    const s = document.createElement('div');
    s.className = 'splitter';
    s.tabIndex = 0;
    s.setAttribute('role', 'separator');
    s.setAttribute('aria-orientation', 'vertical');
    s.setAttribute('aria-controls', 'sidebar');
    s.setAttribute('aria-label', 'Resize navigation');
    s.setAttribute('aria-valuemin', MIN);
    s.setAttribute('aria-valuemax', MAX);

    const current = () => parseFloat(getComputedStyle(html).getPropertyValue('--nav-w')) || DEFAULT;
    const set = (w, persist = true) => {
      w = Math.round(Math.min(MAX, Math.max(MIN, w)));
      html.style.setProperty('--nav-w', `${w}px`);
      s.setAttribute('aria-valuenow', w);
      if (persist) store.set('nav-width', w);
    };
    set(current(), false);

    s.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      s.setPointerCapture(e.pointerId);
      s.classList.add('dragging');
      document.body.classList.add('resizing');
      const startX = e.clientX, startW = current();
      const move = ev => set(startW + ev.clientX - startX, false);
      const up = () => {
        s.removeEventListener('pointermove', move);
        s.classList.remove('dragging');
        document.body.classList.remove('resizing');
        set(current());
      };
      s.addEventListener('pointermove', move);
      s.addEventListener('pointerup', up, { once: true });
      s.addEventListener('pointercancel', up, { once: true });
    });
    s.addEventListener('dblclick', () => set(DEFAULT));
    s.addEventListener('keydown', e => {
      const next = { ArrowLeft: current() - STEP, ArrowRight: current() + STEP, Home: MIN, End: MAX }[e.key];
      if (next !== undefined) { e.preventDefault(); set(next); }
    });
    return s;
  }

  /* ---- Page content -------------------------------------------------------- */

  /** Feature tags as links, from the FEATURES glossary. */
  const featureLinks = keys => (keys ?? [])
    .map(k => C.FEATURES[k] ? `<a href="${C.FEATURES[k].url}" target="_blank" rel="noopener">${esc(C.FEATURES[k].name)}</a>` : '')
    .join('');

  function renderHeader(header) {
    const { category, concept } = here;
    const item = concept ?? category;
    if (!item) return;
    let meta = '';
    if (concept) meta = featureLinks(concept.features) + '<span data-js-lines></span>';
    else meta = `<span>${category.concepts?.length ?? 0} concepts</span>`;
    header.innerHTML = `
      <h1>${esc(item.title)}</h1>
      ${item.summary ? `<p class="summary">${esc(item.summary)}</p>` : ''}
      <div class="meta">${meta}</div>`;
  }

  /** Home: each section with researched categories first, then planned ones. */
  function renderCatalog(root) {
    root.innerHTML = C.sections.map(section => {
      const done = section.categories.filter(isResearched);
      const planned = section.categories.filter(c => !isResearched(c));
      const featured = done.length ? `<ul class="featured">${done.map(c => `
        <li><a href="${categoryUrl(section, c)}">${esc(c.title)}</a><span class="count">${c.concepts.length} concepts</span>
        ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}</li>`).join('')}</ul>` : '';
      const rest = planned.length ? `<ul class="columns" aria-label="Planned">${planned.map(c => `<li>${esc(c.title)}</li>`).join('')}</ul>` : '';
      return `<section class="catalog-section">
        <h2>${esc(section.title)} <span class="count">${done.length} of ${section.categories.length} researched</span></h2>
        ${featured}${rest}</section>`;
    }).join('');
  }

  /** Category: one row per concept with a live, scaled-down thumbnail. */
  function renderConceptRows(root) {
    const { section, category } = here;
    if (!category) return;
    const variant = () => (isDark() ? '#thumb-dark' : '#thumb');
    root.innerHTML = `<ul class="concept-rows">${(category.concepts ?? []).map(k => `
      <li class="concept-row" data-concept="${k.id}">
        <div class="concept-thumb"><iframe loading="lazy" inert aria-hidden="true" title="" data-src="${conceptUrl(section, category, k)}"></iframe></div>
        <div>
          <h3><a href="${conceptUrl(section, category, k)}">${esc(k.title)}</a></h3>
          <p>${esc(k.summary)}</p>
          <div class="meta"><span data-js-lines></span></div>
        </div>
      </li>`).join('')}</ul>`;

    const load = () => root.querySelectorAll('iframe[data-src]').forEach(f => { f.src = f.dataset.src + variant(); });
    load();
    document.addEventListener('site:theme', load);

    // Thumbnails report their JS weight back (see concept.js thumb mode).
    addEventListener('message', e => {
      if (e.data?.type !== 'concept-stats') return;
      const cell = root.querySelector(`[data-concept="${e.data.id}"] [data-js-lines]`);
      if (cell) cell.textContent = jsLabel(e.data.jsLines);
    });
  }

  /** "No JavaScript" or "JS · 24 lines" (shared wording for page + rows). */
  const jsLabel = n => (n ? `JS · ${n} lines` : 'No JavaScript');

  function renderPager(page) {
    const { section, category, concept } = here;
    const list = category.concepts;
    const i = list.indexOf(concept);
    const prev = list[i - 1], next = list[i + 1];
    const link = (k, label) => k ? `<a href="${conceptUrl(section, category, k)}"><span>${label}</span>${esc(k.title)}</a>` : '';
    const nav = document.createElement('nav');
    nav.className = 'pager';
    nav.setAttribute('aria-label', 'More in ' + category.title);
    nav.innerHTML = link(prev, 'Previous') + link(next, 'Next');
    page.append(nav);
  }

  /* ---- Boot ---------------------------------------------------------------- */

  function boot() {
    here = locate(document.body.dataset.page);
    if (html.classList.contains('thumb')) return;   // concept.js renders thumb mode alone
    const { category, concept } = here;
    if (concept) document.title = `${concept.title} · ${category.title}`;
    else if (category) document.title = `${category.title} · ${C.title}`;

    document.body.classList.add('shell');
    document.body.prepend(buildSidebar(), buildSplitter());

    const header = document.querySelector('.page-header[data-auto]');
    if (header) renderHeader(header);
    const catalog = document.querySelector('[data-catalog]');
    if (catalog) renderCatalog(catalog);
    const rows = document.querySelector('[data-concepts]');
    if (rows) renderConceptRows(rows);
    const page = document.querySelector('.page');
    if (concept && page) renderPager(page);
  }

  window.Site = { ROOT, url, store, copy, toast, jsLabel, esc, isDark, get here() { return here; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
