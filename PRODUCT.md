# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and vanilla JS. No build step, no framework, no package manager.
Pages are opened from a network share by `file://` URL, so nothing may rely on
`fetch()`, ES module imports across files, or a dev server. Target browser is current
stable Chrome only; the newest CSS is allowed with no fallbacks (user decision).

## Users

- **Brian (curator):** asks Claude to research a UI category ("find context menus"),
  reviews the results, and keeps the library growing.
- **Product designers (consumers):** receive one concept page as a handoff reference and
  must be able to rebuild that component exactly, in Figma or in code, without a meeting.

## Product Purpose

A design-research "Awesome List" of modern UI patterns, split into **Components** and
**Page Templates**. Each category lists concepts; each concept page is handoff-grade:
live demo, light and dark side by side, the exact HTML/CSS/JS, and a spec sheet.
Success is a designer saying "I can build this from the page alone."

## Positioning

Every example runs live, uses modern CSS before JavaScript, and its spec tables are read
from the running demo's own CSS tokens, so the spec and the code cannot drift apart.

## Operating Context

- Opened directly from a network share (`file://`). Links are passed around as file URLs.
- Research is done in sessions with Claude: one category at a time, several concepts per
  category, each concept a page.

## Capabilities and Constraints

- Prefer CSS (popover, anchor positioning, invoker commands, `light-dark()`, etc.) and
  keep JavaScript to what the platform cannot do yet.
- DRY: one catalog file drives the index, category pages, nav and breadcrumbs; one demo
  harness renders every concept page.
- Demo content (file names, people, numbers) is synthetic illustration, never claims.

## Brand Commitments

Zen minimalism, pinned by the user: simple layouts, few borders and never borders inside
borders, minimal copy, left navigation separated from the main window by a resizable
splitter, system fonts, near-monochrome chrome so the components carry the color.

## Product Principles

1. The demo is the source of truth; prose explains, it never restates values.
2. Platform first: reach for a native element or CSS feature before a script.
3. Handoff-grade or not at all: every concept ships states, tokens, motion, a11y, code.
4. Quiet chrome, loud components.

## Accessibility & Inclusion

Component demos follow the WAI-ARIA Authoring Practices for their pattern (roles,
keyboard model, focus return) and show visible focus styles in both themes.
