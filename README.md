# Design Research

A reference library of modern UI patterns, built as designer handoffs. Every concept page
runs a live demo in light and dark side by side, shows the exact HTML, CSS and JS, and
reads its spec table from the demo's own CSS tokens, so spec and code can't drift apart.

**Browse it:** [brianpollack.github.io/designref](https://brianpollack.github.io/designref/)
(GitHub Pages), or open [`index.html`](index.html) from a local clone.

Target is current stable Chrome. The pages use the newest platform features (popover,
anchor positioning, invoker commands, `focusgroup`, `light-dark()`) with no fallbacks.

## What's here

| Section | Category | Concepts |
|---|---|---|
| Components | [Buttons](components/buttons/) | 13: styles, Material 3, Fluent 2, Carbon, Apple-style, shadcn/ui (Tailwind), pairs, rows, split, segmented, icon/FAB, loading |
| Components | [Context Menus](components/context-menus/) | 10: right-click, overflow, cascading, Material 3 Expressive, Fluent 2, Carbon, glass, radial, long-press, filterable |
| Components | [Tabs](components/tabs/) | 5: underline, scroll-spy, Material 3, Fluent 2, Carbon |
| Page Templates | [Chat & Messaging](templates/chat/) | 6: channel, DM bubbles, composer, meeting panel, Fluent 2 Teams, Matrix room |

About 50 more categories are planned and show dimmed on the home page.

Each concept page has: Anatomy, Specs (auto), Rules check (WCAG plus the core library's own
rules, measured in both frames), Behavior, Code, Accessibility, and Sources.

Other pages:

- [`sources.html`](sources.html): every cited site and page, and the core libraries
  (Material 3, Apple HIG, Fluent 2, Carbon) with their foundations and coverage.
- [`icons.html`](icons.html): icon libraries we use, their licenses, and every icon held.

## How it works

No build step, no framework, no npm dependencies. Pages open straight from disk
(`file://`), so shared data loads through classic `<script>` tags, never `fetch()`.

| File | Role |
|---|---|
| `assets/catalog.js` | Single source of truth: sections, categories, concepts, feature glossary |
| `assets/sources.js` | Cited sites and pages, core-library foundations |
| `assets/concept.js` | Demo harness: theme frames, code tabs, spec table, thumbnails |
| `assets/rules.js` | Rules check run inside the demo frames |
| `assets/site.js`, `site.css` | Sidebar, splitter, theme, headers, lists, pager |
| `assets/icons.js`, `icon-sets.js` | Lucide plus fetched Material, Fluent and Carbon icons |
| `assets/vendor/` | Tailwind CSS browser build, for concepts styled with Tailwind |
| `_scaffold/` | Templates copied by the new-page scripts |

## Scripts

```bash
scripts/open.sh components/context-menus   # open a page in Chrome from disk
scripts/serve.sh                           # serve at http://localhost:8787
scripts/new-category.sh components my-category
scripts/new-concept.sh components/my-category my-concept
node scripts/check.mjs                     # cross-check catalog, files, icons, sources
node scripts/check-links.mjs               # fetch every cited URL, report dead ones
node scripts/fetch-icons.mjs               # download non-Lucide icons into icon-sets.js
```

Add a category or concept to `assets/catalog.js` first, then run the matching script.
`CLAUDE.md` has the full concept page contract and platform notes; `PRODUCT.md` and
`RESEARCH_PLAN.md` cover the purpose and research method.
