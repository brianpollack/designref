---
name: Design Research
description: A quiet reference shelf of modern UI patterns, where the live component is the only loud thing on the page.
colors:
  ground: "#fcfcfd"
  ground-dark: "#121316"
  shelf: "#f4f5f7"
  shelf-dark: "#17181c"
  well: "#eef0f3"
  well-dark: "#1e2025"
  ink: "#17181b"
  ink-dark: "#e7e8eb"
  muted-ink: "#5d626b"
  muted-ink-dark: "#a3a8b1"
  faint: "#8d929b"
  faint-dark: "#6b7079"
  hairline: "#e5e7eb"
  hairline-dark: "#26282e"
  ink-blue: "#2f4fd6"
  ink-blue-dark: "#91a5ff"
  code-comment: "#8a8f98"
  code-comment-dark: "#737985"
  code-string: "#0b7a53"
  code-string-dark: "#7fd1a8"
  code-keyword: "#8a3fb8"
  code-keyword-dark: "#d3a6ff"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.35
  summary:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.3
  mono:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
spacing:
  hairline-gap: "2px"
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "28px"
  section: "56px"
  gutter: "clamp(20px, 4vw, 56px)"
  measure: "68ch"
  nav: "264px"
components:
  ghost-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "28px"
  ghost-button-hover:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
  ghost-button-pressed:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  nav-item-hover:
    backgroundColor: "{colors.well}"
  nav-item-current:
    textColor: "{colors.ink-blue}"
  nav-filter:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    padding: "0 10px"
    height: "30px"
  preview-frame:
    backgroundColor: "{colors.well}"
    rounded: "{rounded.lg}"
    height: "440px"
  code-panel:
    backgroundColor: "{colors.shelf}"
    typography: "{typography.mono}"
    rounded: "{rounded.lg}"
    padding: "18px 20px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
---

# Design System: Design Research

## Overview

**Creative North Star: "The Quiet Reference Shelf"**

The chrome is a shelf, not an exhibit. Near-white (or near-black) grounds, system type, hairline rules and one ink-blue accent hold every page still so the live component in its frame carries all the color and motion. Density is that of a well-set reference book: generous space above headings, tight space below, prose held to a readable measure.

Structure comes from layers and lines, never from boxes. The sidebar sits on a second neutral layer, separated from the main column by a 1px draggable splitter; sections are divided by single hairlines; code and frames sit in soft tonal wells. Both themes are first-class: every color token is a `light-dark()` pair, and the viewer can pin light, dark or system from the sidebar foot.

The look is pinned by the user's brief: simple layouts, few borders, never borders inside borders, minimal copy, a resizable splitter between navigation and main. Demo worlds inside the preview frames are per-concept and documented on their pages; they are subject matter, not this system.

**Key Characteristics:**
- Near-monochrome chrome with one reserved accent.
- Hairlines and tonal layers instead of cards or bordered panels.
- System sans for all text; monospace only for code and measured values.
- Left navigation on its own layer behind a resizable splitter.
- Light and dark shown together, never one as an afterthought.

## Colors

A cool near-neutral palette in two themes, with a single ink-blue that means "you can act here" or "you are here".

### Primary
- **Ink Blue** (light / dark pair): links, the focus ring, the current nav item (text plus an 11% accent tint fill), the splitter while hovered or dragged, text selection (24% tint) and the caret. Link underlines rest at 35% accent and go solid on hover.

### Neutral
- **Ground**: the page.
- **Shelf**: the sidebar layer and the code panel.
- **Well**: hover fills, inline code, keycaps, the filter field, frame and thumbnail backgrounds.
- **Ink**: body text and headings.
- **Muted Ink**: summaries, meta lines, captions, table heads, ghost buttons at rest, nav sub-items. Holds at least 4.5:1 on Ground and Shelf.
- **Faint**: decoration only (list markers). Never text.
- **Hairline**: every rule, divider and frame ring.

### Code syntax
- **Comment** (italic), **String** (green), **Keyword** (violet) and **Tag** (reuses Ink Blue). Used only inside the code viewer.

### Named Rules
**The One Accent Rule.** Ink Blue is the only chromatic color in the chrome, and it marks interaction or location only. Never use it for decoration, headings or fills larger than a nav row.

**The Loud Component Rule.** Color, shadow and motion belong to the demos. If the chrome starts competing with a frame, the chrome is wrong.

## Typography

**Display Font:** system sans (`-apple-system`, SF Pro Text, Segoe UI, `system-ui`)
**Body Font:** same system sans
**Label/Mono Font:** `ui-monospace` (SF Mono, Menlo, Consolas)

**Character:** One native sans at a small, tight scale; hierarchy comes from weight (600 for headings) and Muted Ink, not from size jumps. Mono marks anything a designer might copy: code, token names, measured values.

### Hierarchy
- **Display** (600, 30px, 1.15, -0.02em): the page title only, one per page.
- **Headline** (600, 17px, 1.3, -0.01em): section headings.
- **Title** (600, 14px, 1.35): sub-headings; 16px for concept-row titles on category pages.
- **Summary** (400, 16.5px, Muted Ink): the one-line page summary under the title.
- **Body** (400, 15px, 1.55): prose, capped at 68ch; tables at 13.5 to 14px.
- **Label** (600, 12.5px, Muted Ink): nav group headings, table column heads, figure captions (400). Sentence case, no tracking.
- **Mono** (400, 12.5px, 1.65): code panel; 12px for token names, 11.5px for raw values.

### Named Rules
**The Weight-Not-Size Rule.** Separate levels with weight and ink, not with bigger type. Nothing in the chrome exceeds 30px.

**The Mono-Means-Exact Rule.** Monospace appears only on code and measured values. Never on labels, nav or prose.

## Layout

A three-column grid: sidebar (264px default, 200 to 480px, set by the splitter and persisted per viewer), a zero-width splitter column, and main (`minmax(0, 1fr)`). Sidebar and splitter are sticky at full viewport height; main is an inline-size container so its content responds to the splitter, not the window.

Pages pad 44px top, 96px bottom, with a fluid gutter (`clamp(20px, 4vw, 56px)`) and a 1240px cap. Sections start 56px apart; a ruled section adds a hairline and 40px above its heading; headings sit 14px above their content. Prose and summaries hold to 68ch.

Concept pages show two live frames side by side (Light | Dark, 16px apart, 440px tall by default), stacking to one column when main is under 860px. Category pages list one concept per row: a 320px live thumbnail beside text, 28px apart, stacking under 760px. Home lists categories in flowing columns (`columns: 3 200px`).

Under 760px viewport the sidebar stacks above main as a sticky bar with a menu button; the splitter is removed.

## Elevation & Depth

Flat. Depth is conveyed by tonal layers (Ground, Shelf, Well) and by 1px hairlines, never by drop shadows. The only `box-shadow` in the chrome is a zero-offset 1px Hairline ring (`0 0 0 1px`) around preview frames and thumbnails, used because the ring must sit outside an iframe without changing its size. The copy toast is an inverted Ink pill, also shadowless.

### Named Rules
**The Tone-Not-Shadow Rule.** To lift a surface, move it one step along Ground to Shelf to Well. Do not add a shadow.

## Shapes

Gently rounded, small radii that grow with the size of the surface: 4px for inline code, keycaps, swatches and the focus ring; 6px for ghost buttons and nav rows; 8px for thumbnails and the toast; 10px for preview frames and the code panel. Borders are single hairlines on one edge (section tops, table rows, list rows); full outlines appear only as the frame ring. Icons are Lucide line icons at 16px, 2px stroke, round caps, in `currentColor`.

### Named Rules
**The Rules-Divide Rule.** Hairlines run between rows and sections; they do not enclose. The only enclosing line is the frame ring around live content, and nothing bordered ever sits inside something bordered.

## Components

### Ghost Button
The chrome's only button: quiet until touched.
- **Shape:** 6px radius, 28px tall, 10px side padding, 6px icon-to-label gap.
- **Rest:** no background, Muted Ink, 13px.
- **Hover / Pressed / Selected:** Well fill, Ink text. Pressed state (`aria-pressed`) and selected tab (`aria-selected`) share the hover look.
- **Focus:** the global 2px Ink Blue outline, 2px offset.
- Used for the preview toolbar (Reset, Open standalone), code tabs, Copy, the theme switch and the mobile menu button.

### Navigation
- **Brand:** 15px, 600, Ink, no underline.
- **Filter:** 30px field on Well, 6px radius, no border, 13px; `/` focuses it.
- **Groups:** Label-style heading, then rows of 13.5px Ink at 4px 8px padding, 6px radius; Well on hover. Children indent 10px at 13px Muted Ink.
- **Current page:** Ink Blue text on an 11% Ink Blue tint.
- **Counts:** right-aligned, 12px Muted Ink, tabular numerals.
- **Planned:** a disclosure in Muted Ink with a drawn 14px chevron that turns 90 degrees when open.
- **Theme switch:** three ghost icon buttons (light, dark, system) in the sidebar foot.

### Splitter
A 1px Hairline rule with a 9px invisible hit area. On hover, drag or keyboard focus it widens to 2px Ink Blue (150ms). Arrow keys move it in 16px steps, Home/End jump to the bounds, double-click resets.

### Preview Frames (signature)
- Two iframes, Light and Dark, each with a 12.5px Muted Ink caption above.
- 10px radius, Well background, Hairline ring, height from the page (440px default).
- A toolbar above holds a one-line Muted Ink hint and ghost buttons.

### Spec Table
Description first (Ink), token name beneath it (12px mono, Muted Ink), then Light and Dark value columns in 12.5px mono with a 14px checkered swatch for colors. Rows are divided by Hairlines; group rows get 26px above and an Ink underline.

### Code Viewer
Ghost-button tabs and copy actions above a Shelf panel (10px radius, 18px 20px padding, 560px max height, scrolls). Syntax uses the four code colors only.

### Lists
- **Key/value tables:** hairline rows, no outer border, keys in 500 weight.
- **Featured and concept rows:** full-width rows divided by Hairlines; the whole concept row is the link and its title turns Ink Blue on hover.
- **Pager:** previous/next at the page foot, above a Hairline, with a 12.5px Muted Ink direction label.

### Toast
Fixed bottom-right, Ink background, Ground text, 8px radius, 13px. Fades and rises 6px over 180ms.

## Do's and Don'ts

### Do:
- **Do** take every color from the tokens; each is a `light-dark()` pair, and both themes must read.
- **Do** reserve Ink Blue for links, focus, the current location and the active splitter.
- **Do** separate sections with space first and a single Hairline second.
- **Do** use the ghost button for every chrome action.
- **Do** keep prose and summaries at or under 68ch.
- **Do** use Lucide line icons at 16px in `currentColor`.
- **Do** keep motion in the chrome to 150 to 180ms state fades.

### Don't:
- **Don't** wrap content in cards or bordered panels, and never nest a border inside a border.
- **Don't** add drop shadows to chrome surfaces; lift with a tonal step instead.
- **Don't** introduce a second accent color or tint headings.
- **Don't** set Faint as text color.
- **Don't** use monospace for anything but code and measured values.
- **Don't** let chrome color, motion or shadow compete with the live demos.
