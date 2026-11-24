# Research plan

How a category goes from "find me context menus" to a set of handoff-grade pages.

## Goal

A reference a designer can build from without a meeting, and a developer can copy from
without a rewrite. Each concept shows the most modern way to build the pattern in current
Chrome, with as little JavaScript as the platform allows.

## Structure

| Level | Example | Lives in |
|---|---|---|
| Section | Components, Page Templates | `assets/catalog.js` → `sections` |
| Category | Context Menus | `components/context-menus/index.html` |
| Concept | Right-Click Menu | `components/context-menus/right-click-menu.html` |

The backlog is the catalog itself: categories without `concepts` show as planned
(dimmed) on the home page and in the nav.

## Workflow for one category

1. **Survey** (1 pass, sources below). Collect candidate forms of the pattern and the
   platform features that now cover parts of it. Note which features are new enough to
   need a support check in current Chrome.
2. **Shortlist 5–8 concepts.** Each must differ in *technique or form*, not just color.
   Aim for this spread:
   - the platform baseline (the canonical form, built the modern way);
   - the zero- or lowest-JS variant;
   - one or two design-system-faithful versions a designer may be asked to match
     (Material 3, Apple HIG-inspired, Fluent 2, Carbon…) with their real token values;
   - one or two expressive or unusual forms;
   - a touch or mobile form;
   - a power-user form (dense, keyboard-first) when it applies.
3. **Verify features** in the in-app browser (`CSS.supports`, `'x' in HTMLElement.prototype`)
   before designing around them.
4. **Build** each concept page against the checklist below.
5. **Write the category page**: summary in the catalog, a "Choosing one" table, the shared
   modern stack, sources.
6. **Verify** every page (see CLAUDE.md) and run `node scripts/check.mjs`.

## Selection criteria for a concept

- Works in current stable Chrome with no flags.
- Uses the platform first: popover, dialog, invoker commands, interest invokers,
  anchor positioning, focusgroup, `:has()`, container queries, `@starting-style`,
  view transitions, scroll-driven animation.
- Has real-world provenance: a design system, a shipped product, or platform guidance.
- Accessible by default: follows the WAI-ARIA APG pattern for its role.
- Distinct enough that a designer would choose between it and its neighbours.

## Concept page checklist (handoff-grade)

- [ ] Realistic demo surface (not a lone component on a blank canvas), synthetic content.
- [ ] Opens at rest in both themes via a pin script.
- [ ] Every color, size, radius, shadow and timing is a documented token.
- [ ] All states: default, hover, focus-visible, active/pressed, disabled, selected/checked,
      destructive where relevant, empty/overflow where relevant.
- [ ] Motion specified (duration, easing, origin) and disabled under reduced motion.
- [ ] Viewport-edge behavior (flip, shrink, scroll) demonstrated.
- [ ] Keyboard map and roles documented; focus return verified.
- [ ] JavaScript only where the platform can't; every block commented.
- [ ] Sources cited with what each contributed.

## Sources by tier

1. **Platform guidance:** Chrome modern web guidance (developer.chrome.com/docs/modern-web-guidance),
   MDN, web.dev, Open UI explainers, WAI-ARIA APG.
2. **Design systems (for faithful variants):** Material 3 (m3.material.io; exact tokens
   from the Compose source `androidx/compose/material3/.../tokens`), Apple HIG, Fluent 2,
   Carbon, Atlassian, Primer, Radix / Base UI / React Aria (behavior details).
3. **Technique writing and demos:** Una Kravets, Adam Argyle, Jhey Tompkins, Frontend
   Masters, CSS-Tricks, Smashing, ICS Media, CodePen.

## Suggested order

Components that reuse what Context Menus established come first:

1. Dropdown Menus & Menu Bars (same menu stack, adds menubar linking)
2. Tooltips and Hover Cards (interest invokers, `popover="hint"`)
3. Selects (customizable `<select>` with `appearance: base-select`)
4. Dialogs & Modals, Drawers & Sheets (`<dialog>`, `closedby`, view transitions)
5. Tabs, Segmented Controls (scroll-driven indicators, `:has()`)
6. Toasts & Notifications, Command Palettes
7. Splitters & Resizable Panes, Tree Views, Data Tables

Page Templates start once five or more component categories exist to compose from:
Settings, Admin Dashboard, List & Detail, Sign In & Sign Up.

## Decisions

- 2026-11-24 — Chrome-only, newest features, no fallbacks (Brian).
- 2026-11-24 — Pages are shared as `file://` URLs from a network share; no hosting.
- 2026-11-24 — Site chrome follows the zen-minimal brief in Brian's CLAUDE.md.
