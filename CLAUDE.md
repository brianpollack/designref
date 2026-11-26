# Design Research — project notes for Claude

An "Awesome List" of modern UI patterns: **Sections** (Components, Page Templates) →
**Categories** (Context Menus, Tabs…) → **Concepts** (one page each). Every concept page
is a designer handoff: live demo in light and dark, exact code, spec table, behavior,
accessibility. Product context: `PRODUCT.md`. How research is done: `RESEARCH_PLAN.md`.

## Hard constraints

- Opened from a network share via `file://`. No `fetch()`, no ES module imports between
  files, no dev server required. Shared data is loaded with classic `<script>` tags.
- Target is current stable Chrome only. Use the newest HTML/CSS freely; no fallbacks.
- No build step, no framework, no npm dependencies.
- DRY: the catalog drives every list; one harness renders every concept page.

## Files

```
index.html                     Home: renders the catalog
sources.html                   Core libraries (foundations, coverage) and every cited site
icons.html                     Icon libraries: license, style, comparison, every icon we hold
assets/catalog.js              Single source of truth: sections, categories, concepts, FEATURES glossary
assets/sources.js              Sites, cited pages, and core-library foundations (cited by id from the catalog)
assets/site.js / site.css      Chrome: sidebar, splitter, theme, headers, lists, pager
assets/concept.js              Demo harness: light/dark frames, code tabs, spec table, thumbnails
assets/icons.js                Lucide icon set and the Icons API (lookup, svg, spriteFor)
assets/icon-libraries.js       Icon libraries we track: license, style, naming, fetch source, examples
assets/icon-sets.js            GENERATED artwork for non-Lucide sets (scripts/fetch-icons.mjs)
assets/icons-page.js           Renders icons.html
assets/rules.js                Rules check: WCAG + per-core-library rules, measured in the demo frames
components/<category>/index.html         Category page
components/<category>/<concept>.html     Concept page
templates/<category>/…                   Page Templates section (same layout)
_scaffold/                     Copy-from templates for new pages
scripts/                       new-category.sh, new-concept.sh, check.mjs, check-links.mjs, fetch-icons.mjs, open.sh, serve.sh
```

## Adding things

- **Category:** add it to `assets/catalog.js` (with `summary` and `concepts: []`), then
  `scripts/new-category.sh components my-category`. Fill the "Choosing one" table and the
  "modern stack" notes once its concepts exist. Give it `specs` (each core library's own
  page for this component) and `refs`.
- **Concept:** add it to the category's `concepts` in `catalog.js` (`id`, `title`,
  `summary`, `features` keys from `FEATURES`, `refs`, and `system` when it follows a core
  library), then `scripts/new-concept.sh components/context-menus my-concept`. Fill the
  demo blocks and the authored sections.
- **Sources:** every page we learn from goes in `assets/sources.js` → `pages` once (new
  site → `sites`), then is cited by id: `refs: [['chrome-menu', 'what it contributed.']]`.
  Never write a Sources list by hand; `data-sources` renders it, and sources.html lists
  each page with what cites it.
- **Core libraries** (Material 3, Apple HIG, Fluent 2, Carbon) are the design systems a
  designer may be asked to match exactly. Every category gets at least one concept built
  to a core library (Material 3 first), with `system: 'material-3'` and every value taken
  from that library's own token source. Our own values in a library's style are
  `inspired: true`. Their foundations live in `sources.js` → `systems`; every row cites the
  page it was read from, and nothing unverified goes in.
- **Icons:** a concept built to a core library uses that library's own icons when its
  license allows: `icons: 'material-symbols'` / `'fluent-system-icons'` / `'carbon-icons'`
  in the catalog (default `'lucide'`; SF Symbols can't ship, so Apple-style pages use
  Lucide). Reference icons by the library's own name (`#i-more_vert`, `#i-trash-can`),
  then run `node scripts/fetch-icons.mjs` to download them into `icon-sets.js`. Every
  concept page credits its set above Behavior automatically. A new icon library goes in
  `icon-libraries.js` with its license, style, naming and the comparison `examples`.
- Run `node scripts/check.mjs` after any change: it cross-checks catalog, files, icons,
  feature keys and every source id. `node scripts/check-links.mjs` fetches every cited URL
  and reports dead or moved ones (run it before committing new sources).

## Rules check (assets/rules.js)

Concept pages with a `system` (built to or inspired by a core library) get a "Rules check"
table after Specs, run by `concept.js` in both theme frames: target size, contrast, accessible
names, focus style, reduced motion, plus that library's own rules (Apple HIG hit region by
`platform: 'ios' | 'macos' | 'visionos'`, Material 3 48dp). Each rule cites a page in
`sources.js`; a rule with no `check` shows "Review by hand". A pass means the rule held in the demo,
never that the page "meets" the library. Add a rule only from a page you have read. Disabled
controls are exempt from contrast. Design demos to pass what is measurable.

## Concept page contract (read `components/context-menus/right-click-menu.html` first)

Demo source lives in four blocks; `concept.js` builds everything else from them.

| Block | Purpose |
|---|---|
| `<script type="text/plain" data-demo="html">` | Markup: a realistic app surface plus the component |
| `<style data-demo="css" media="not all">` | Tokens on `:root`, component CSS, then demo-surface CSS |
| `<script type="text/plain" data-demo="js">` | Only what the platform can't do. Optional |
| `<script type="text/plain" data-demo="pin">` | Puts the demo in its "open at rest" state. Hidden from code |

Rules:

- **Colors only through `light-dark()`**, with `:root { color-scheme: light dark; }`. The
  harness forces each frame's scheme. Never use `prefers-color-scheme` in demos.
- **Tokens** go on `:root` with a trailing `/* description */` comment to appear in the
  spec table; group them with `/* @group Name */`. Prefix per concept (`--cm-`, `--om-`…).
  Put typography facts the table can't hold (line height, weight) in the description.
  Demo-surface styles (the fake app around the component) get no token comments.
- **Icons:** `<svg class="icon"><use href="#i-copy"/></svg>`. Names must exist in the
  concept's icon set: Lucide icons are pasted into `assets/icons.js`; other sets come from
  `scripts/fetch-icons.mjs`. The harness builds a sprite of only the icons used. Lucide
  symbols are strokes; the other sets are filled shapes in `currentColor`.
- **Pin scripts simulate input** (dispatch `contextmenu`, click the trigger) rather than
  calling demo internals. Any `focus()` in a demo passes `preventScroll: true`, so loading
  the page never scrolls it.
- **JavaScript is a cost.** The header shows its line count. Comment *why* each part
  exists. Prefer `popover`, `commandfor`/`command`, `interestfor`, anchor positioning,
  `focusgroup`, `@starting-style`, `:has()` over script.
- **Accessibility** follows WAI-ARIA APG for the pattern. Visible focus in both themes.
- IDs only need to be unique within the demo (each frame is its own document).

Authored sections, in this order: Anatomy (`.kv` table), Specs (`data-spec`, auto),
Behavior (`.kv` table), Code (`data-code`, auto), Accessibility (key table + short list),
Sources (`data-sources`, auto from the concept's `refs`). Category pages add Core libraries
(`data-core`, auto from `specs`) before The modern stack.

## Platform notes (verified in Chrome 156 while building Context Menus)

- **Popover shells:** reset the UA box (`inset: auto; margin: 0; padding: 0; border: 0;
  background: none; overflow: visible`). Put `focusgroup` on a child, never the popover.
- **Open at a point:** a zero-size `position: fixed` anchor moved to the pointer, then
  `showPopover({ source: anchor })`. Invokers anchor implicitly; no `anchor-name` needed.
- **Grow from the right corner:** `container-type: anchored` on the popover, then
  `@container anchored(fallback: flip-block)` etc. on its children.
- **focusgroup:** `"menu nomemory"` handles ↑/↓ only, wraps, skips disabled. Add
  `inline block` for ←/→ (radial, grids). Shift+Tab inside it does not move focus. `focusgroup="tablist inline wrap"` did nothing
  in Chrome 156, so tabs use a keydown handler.
- **Focus never scrolls the host:** `autofocus` in a popover and `showModal()`'s initial
  focus both scroll the embedding page; use a `toggle` listener with
  `focus({ preventScroll: true })`, and give pins a no-focus path. Any focus inside a frame
  makes the host's `activeElement` the iframe; thumbnails avoid this with an inert body.
- **Interest invokers:** CSS is `interest-delay-start` / `interest-delay-end` (shorthand
  `interest-delay`); pseudo-classes `:interest-source` / `:interest-target`. Esc closes the
  whole chain unless `preventDefault()`; returning focus to a trigger re-fires interest
  (the `interest` event is cancelable and has `.source`).
- **Shared popovers:** one popover for many invokers works, but clicking a second invoker
  closes it instead of moving it. Prefer one popover per trigger.
- **Scroll containers are focusable** in Chrome; give a scrolling list `tabindex="-1"` if
  Tab must leave the component.
- **Lucide via `<use>` can't be filled** (`fill="none"` on the symbol); use a CSS mask.
- **Keyboard context menu:** synthetic keys don't fire the browser's own `contextmenu`, so
  demos also handle Shift+F10 / ContextMenu on `keydown` (testable and consistent).
- **Pin scripts share the demo's global scope:** a `const` in the pin that is also declared in
  the demo's js is a SyntaxError and the pin silently does nothing; wrap the pin in `{ … }`.
- **`hidden` loses to `display`:** `.x { display: flex }` overrides the `hidden` attribute; put
  `display` on `.x:not([hidden])`.
- **Chat logs:** `role="log"`, bottom-rest with `margin-top: auto` on the first child (not
  `column-reverse`); `field-sizing: content` grows a textarea; `:has()` groups bubbles.
- **Dev server caching:** after editing `assets/*`, run
  `await fetch('/assets/site.css', {cache: 'reload'})` in the tab before reloading.

## Writing and visual rules

- Copy is short, sentence case, factual. No eyebrow/kicker labels, no marketing words.
- The chrome stays quiet: one accent (`--accent`), hairline rules, no boxes inside boxes.
  Components carry the color, not the site.
- Brian's preferences: well-commented code, DRY, minimal UI, resizable splitters, and
  never the word "idempotent".

## Verify before calling anything done

1. Start the preview server (`.claude/launch.json` → "design-research", or
   `scripts/serve.sh`) and open `http://localhost:8787/...`. The in-app browser can't
   load `file://` pages with their assets; Brian opens them from disk.
2. Both frames render the component open at rest; interact in each (pointer + keyboard).
3. Spec table values look right in both themes; no console errors.
4. Category page thumbnail renders; `node scripts/check.mjs` passes.
