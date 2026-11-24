---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["components/context-menus/index.html"]
---

# Surface: Design Research site (index, category pages, concept pages)

Mode: Read (reference library) with Operate affordances (copy code, replay demos).
Audience: Brian (curator) and product designers receiving one concept page by file:// URL.
Job: rebuild a component exactly from one page: live demo light+dark, tokens, code, behavior.
Constraints: static files, file:// only (no fetch), current Chrome only, DRY catalog + harness.

## Direction contract

THESIS: A quiet reference shelf where the component is the only loud thing on the page. It refuses the gallery-of-identical-cards template and the docs-site hero.

OWN-WORLD: Near-white ground (#fcfcfd) or near-black (#121316), one ink-blue accent reserved for links, focus and the active nav item. System sans for everything, ui-monospace only for code and measured values. Hairline rules between sections, no boxed panels, no nested borders. Left nav on a second neutral layer, separated by a draggable splitter.

STORY: The designer opens a file URL, sees the component already open in light and dark, scans the token table for exact values, copies the code, done.

FIRST VIEWPORT: Concept page: title and one-line summary top-left of main, a single muted line of platform features and JS weight under it; directly below, two live frames side by side (Light | Dark) spanning the main column, ~440px tall, menus open at rest. Sidebar 264px at left.

FORM: seed: none (pinned) - "Stick to simple layouts, few borders and never too many borders within borders. Keep extra text to a minimum. Use spitters that can resize to seperate ares like a left navigation from a main window. Follow a zen-line design philosophy." (user CLAUDE.md, confirmed in chat)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
