/**
 * icons-page.js — renders icons.html from assets/icon-libraries.js and the icon artwork.
 *
 * Loaded only by icons.html, after site.js (it uses window.Site helpers). Renders into
 * [data-icons-page]:
 *   1. A comparison table: one row per EXAMPLE_ROWS entry, one column per shipped library,
 *      so the same idea can be compared across sets.
 *   2. One section per library (id = library id, the sidebar's anchors): owner, license,
 *      style, naming, which concepts use it, and every icon this site has from it.
 * Libraries we track but cannot ship (shipped: false) get a section with the reason.
 */
(function () {
  'use strict';

  const C = window.CATALOG;
  const { EXAMPLE_ROWS, libraries } = window.ICON_LIBRARIES;
  const S = window.SOURCES;

  /** Concepts that draw their icons from library `id`, as links. Lucide is the default. */
  function usedIn(id) {
    const out = [];
    for (const section of C.sections) {
      for (const cat of section.categories) {
        for (const k of cat.concepts ?? []) {
          if ((k.icons ?? 'lucide') === id) out.push(`<a href="${Site.conceptUrl(section, cat, k)}">${Site.esc(k.title)}</a>`);
        }
      }
    }
    return out;
  }

  /** Every icon name this site holds for a library. */
  const namesOf = id => Object.keys(id === 'lucide' ? Icons.ICONS : window.ICON_SETS?.[id] ?? {}).sort();

  /** One icon tile: the glyph, then its name in the library's own spelling. */
  const tile = (id, name) => `<li>${Icons.svg(name, 'icon', id)}<code>${Site.esc(name)}</code></li>`;

  function compareTable(ids) {
    const head = ids.map(id => `<th><a href="#${id}">${Site.esc(libraries[id].name)}</a></th>`).join('');
    const rows = Object.entries(EXAMPLE_ROWS).map(([key, label]) => `<tr><th>${Site.esc(label)}</th>${ids.map(id => {
      const name = libraries[id].examples?.[key];
      return `<td>${name ? `${Icons.svg(name, 'icon', id)}<code>${Site.esc(name)}</code>` : ''}</td>`;
    }).join('')}</tr>`).join('');
    return `
      <section class="ruled" id="compare">
        <h2>Side by side</h2>
        <div class="icon-compare-wrap"><table class="icon-compare"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
        <p class="spec-note">All shown at 24px in the text color. Names are each library’s own, as used in <code>#i-&lt;name&gt;</code>.</p>
      </section>`;
  }

  function librarySection(id) {
    const lib = libraries[id];
    const shipped = lib.shipped !== false;
    const names = shipped ? namesOf(id) : [];
    const concepts = usedIn(id);
    const system = lib.system ? `<a href="${Site.url('sources.html')}#${lib.system}">${Site.esc(S.sites[lib.system].short ?? S.sites[lib.system].name)}</a>` : '';
    const rows = [
      ['License', `<a href="${lib.licenseUrl}">${Site.esc(lib.license)}</a>`],
      ['Style', Site.esc(lib.style)],
      ['Names', Site.esc(lib.names)],
      ['Use', Site.esc(lib.use)],
      lib.note ? ['Note', Site.esc(lib.note)] : null,
      concepts.length ? ['Used in', concepts.join(', ')] : null,
    ].filter(Boolean).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
    return `
      <section class="ruled library" id="${id}">
        <h2>${Site.esc(lib.name)}<span class="count">${Site.esc(lib.owner)}</span></h2>
        <div class="meta">
          ${system ? `<span>Core library: ${system}</span>` : ''}
          <a href="${lib.url}">Browse the library</a>${lib.docs ? `<a href="${lib.docs}">Documentation</a>` : ''}
          ${shipped ? `<span>${names.length} icons here</span>` : '<span>Not shipped</span>'}
        </div>
        <table class="kv"><tbody>${rows}</tbody></table>
        ${names.length ? `<ul class="icon-grid">${names.map(n => tile(id, n)).join('')}</ul>` : ''}
      </section>`;
  }

  function render(root) {
    const ids = Object.keys(libraries);
    const shipped = ids.filter(id => libraries[id].shipped !== false);
    root.outerHTML = compareTable(shipped) + ids.map(librarySection).join('');
  }

  function boot() {
    const root = document.querySelector('[data-icons-page]');
    if (root) render(root);
  }
  // site.js builds the shell on DOMContentLoaded; render after it so anchors exist together.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
