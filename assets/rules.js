/**
 * rules.js — the "Rules check" for concept pages built to a core library.
 *
 * What it is: a short list of design-system and accessibility rules that can be measured in a
 * live demo. concept.js runs them inside both theme frames and shows pass, fail or "review"
 * per rule, each linked to the page it came from. It does NOT say a page "meets" a system:
 * most guidance (wording, feel, hierarchy) cannot be tested, so those rules are listed as
 * "review by hand".
 *
 * Shape (window.RULES)
 *   universal[]        Rules for every page that has a rules check (WCAG).
 *   systems[id][]      Extra rules for one core library (id = sources.js → systems).
 *   each rule:
 *     id        Unique, kebab-case.
 *     text      The rule in plain words.
 *     source    A key of SOURCES.pages: the page the rule was read from. Required.
 *     check     function (ctx) → { pass: true|false|'review', detail?, items?: string[] }.
 *               Omit for a rule only a person can judge (shown as "Review").
 *     options   Optional: a function (concept) → object of thresholds, e.g. by platform.
 *   ctx = { win, doc, scheme, concept, els(), name(el), contrast(el) } — see `makeContext`.
 *
 * Loaded on demand by concept.js (classic script, so it works from file://). check.mjs
 * validates that every rule cites a real source page.
 */
(function () {
  'use strict';

  /* ---- Measuring helpers (run against a frame's window) ---------------------------------- */

  /** Elements a person can operate: native controls and ARIA widget roles. */
  const INTERACTIVE = [
    'button', 'a[href]', 'input:not([type=hidden])', 'select', 'textarea', 'summary',
    '[role=button]', '[role=tab]', '[role=menuitem]', '[role=menuitemradio]', '[role=menuitemcheckbox]',
    '[role=switch]', '[role=checkbox]', '[role=radio]', '[role=option]', '[role=link]', '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  /** True when the element is rendered, takes pointer input, and isn't inside something inert. */
  function visible(win, el) {
    const cs = win.getComputedStyle(el), r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none'
      && cs.opacity !== '0' && !el.closest('[inert]');
  }

  /** Short human label for an element in a failure list: <tag> "text". */
  function label(el) {
    const t = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return `<${el.localName}>${t ? ` “${t}”` : ''}`;
  }

  /** Accessible name, close enough for a check: aria-labelledby, aria-label, content, title, alt, value. */
  function accessibleName(doc, el) {
    const by = el.getAttribute('aria-labelledby');
    if (by) return by.split(/\s+/).map(id => doc.getElementById(id)?.textContent ?? '').join(' ').trim();
    const own = el.getAttribute('aria-label')?.trim();
    if (own) return own;
    // Form controls get their name from <label for> or a wrapping <label>, exposed as el.labels.
    if (el.labels?.length) return [...el.labels].map(l => l.textContent).join(' ').trim();
    const text = el.textContent.trim() || el.querySelector('img[alt]')?.alt?.trim() || el.querySelector('svg title')?.textContent.trim();
    return text || el.getAttribute('title')?.trim() || el.getAttribute('alt')?.trim() || (el.value ?? '').toString().trim() || '';
  }

  /** CSS color string → [r, g, b, a] (0–255, a 0–1), via a 1px canvas so any color syntax works. */
  function rgba(win, css) {
    const c = win.document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    c.canvas.width = c.canvas.height = 1;
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = '#000'; c.fillStyle = css;
    c.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  }

  const lum = ([r, g, b]) => { const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  /** Composite foreground color f (with alpha) over opaque background b. */
  const over = (f, b) => [0, 1, 2].map(i => f[i] * f[3] + b[i] * (1 - f[3]));

  /**
   * Contrast of an element's text against what is behind it. Walks up the ancestors compositing
   * background colors. A gradient, image or backdrop-filter in the way means the answer would be
   * a guess, so it returns null and the caller shows "review".
   */
  function contrastOf(win, el) {
    let bg = [255, 255, 255], layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = win.getComputedStyle(n);
      if (cs.backgroundImage !== 'none' || cs.backdropFilter !== 'none') return null;
      const c = rgba(win, cs.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] === 1) break;
    }
    for (const c of layers.reverse()) bg = over(c, bg);
    const cs = win.getComputedStyle(el);
    const fg = rgba(win, cs.color);
    fg[3] *= parseFloat(cs.opacity);
    const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    return { ratio: ratio(over(fg, bg), bg), large: px >= 24 || (px >= 18.66 && bold) };
  }

  /**
   * Every :focus / :focus-visible rule in the frame's stylesheets that changes something you can see,
   * as { base } where `base` is the selector with the focus pseudo-class removed (so el.matches works).
   * Nested rules (`&:focus-visible`) are resolved against their parent selector.
   */
  function focusRules(doc) {
    const out = [], VISUAL = /^(outline|box-shadow|background|border|color|text-decoration|filter|transform)/;
    const walk = (rules, parent) => {
      for (const r of rules) {
        if (r.selectorText !== undefined) {
          const sel = parent ? r.selectorText.replace(/&/g, `:is(${parent})`) : r.selectorText;
          if (/:focus(-visible)?(?![\w-])/.test(sel) && [...r.style].some(p => VISUAL.test(p) && r.style.getPropertyValue(p) && !/^(none|0)$/.test(r.style.getPropertyValue(p)))) {
            for (const part of sel.split(',')) {
              const base = part.replace(/:focus-visible|:focus(?![\w-])/g, '').trim() || '*';
              if (/:focus/.test(part)) out.push({ base });
            }
          }
          if (r.cssRules?.length) walk(r.cssRules, sel);
        } else if (r.cssRules) walk(r.cssRules, parent);
      }
    };
    for (const sheet of doc.styleSheets) { try { walk(sheet.cssRules, ''); } catch { /* cross-origin sheet */ } }
    return out;
  }

  /** Text-bearing, enabled, visible elements: those with a direct non-empty text node. */
  function textEls(doc, win) {
    return [...doc.body.querySelectorAll('*')].filter(el => {
      // Disabled controls (and anything inside one, or inside a disabled fieldset) are exempt from contrast rules.
      if (el.closest('script,style,svg,[aria-hidden=true],:disabled,[aria-disabled=true]')) return false;
      return [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && visible(win, el);
    });
  }

  /**
   * Build the context a rule receives for one frame. `els()` is computed lazily and cached.
   * @param {Window} win   The demo frame's window.
   * @param {string} scheme 'light' | 'dark'.
   * @param {object} concept The catalog entry (for platform and system).
   */
  function makeContext(win, scheme, concept) {
    const doc = win.document;
    let list;
    return {
      win, doc, scheme, concept,
      els: () => (list ??= [...doc.querySelectorAll(INTERACTIVE)].filter(el => visible(win, el))),
      textEls: () => textEls(doc, win),
      name: el => accessibleName(doc, el),
      contrast: el => contrastOf(win, el),
      label,
    };
  }

  /** Turn a list of failing elements into a check result. */
  const verdict = (bad, total, noun) => bad.length
    ? { pass: false, detail: `${bad.length} of ${total} ${noun}`, items: bad }
    : { pass: true, detail: `${total} checked` };

  /* ---- Rules every checked page gets (WCAG 2.2) ------------------------------------------ */

  const universal = [
    {
      id: 'wcag-target-min',
      text: 'Every control is at least 24 × 24 CSS px.',
      source: 'wcag-target-size',
      check(ctx) {
        // Inline links inside running text are exempt in the criterion, so they are skipped.
        const all = ctx.els().filter(el => !(el.localName === 'a' && el.closest('p,li') && getComputedStyle(el).display === 'inline'));
        const bad = all.filter(el => { const r = el.getBoundingClientRect(); return r.width < 23.5 || r.height < 23.5; }).map(ctx.label);
        return verdict(bad, all.length, 'controls under 24px');
      },
    },
    {
      id: 'wcag-contrast',
      text: 'Text has at least 4.5:1 contrast (3:1 for large text).',
      source: 'wcag-contrast-minimum',
      check(ctx) {
        const bad = []; let n = 0, guess = 0;
        for (const el of ctx.textEls()) {
          const c = ctx.contrast(el);
          if (!c) { guess++; continue; }
          n++;
          if (c.ratio < (c.large ? 3 : 4.5)) bad.push(`${ctx.label(el)} ${c.ratio.toFixed(1)}:1`);
        }
        if (bad.length) return { pass: false, detail: `${bad.length} of ${n} text runs`, items: bad };
        if (guess) return { pass: 'review', detail: `${n} measured; ${guess} sit on a gradient, image or blur` };
        return { pass: true, detail: `${n} text runs measured` };
      },
    },
    {
      id: 'wcag-name',
      text: 'Every control has an accessible name.',
      source: 'wcag-name-role-value',
      check(ctx) {
        const all = ctx.els();
        return verdict(all.filter(el => !ctx.name(el)).map(ctx.label), all.length, 'controls without a name');
      },
    },
    {
      id: 'wcag-focus',
      text: 'Every control has a focus style that changes how it looks.',
      source: 'wcag-focus-visible',
      check(ctx) {
        // Looks for a :focus or :focus-visible rule that matches the control and sets something visible.
        // Script-driven focus does not always match :focus-visible, so the stylesheet is read instead.
        // It proves a focus style exists, not that it is good enough: judge size and contrast by eye.
        const rules = focusRules(ctx.doc), bad = [], all = ctx.els();
        for (const el of all) if (!rules.some(r => { try { return el.matches(r.base); } catch { return false; } })) bad.push(ctx.label(el));
        return verdict(bad, all.length, 'controls with no focus style');
      },
    },
    {
      id: 'wcag-motion',
      text: 'Animation stops under reduced motion.',
      source: 'wcag-animation',
      check(ctx) {
        const animated = [...ctx.doc.body.querySelectorAll('*')].some(el => {
          const cs = ctx.win.getComputedStyle(el);
          return parseFloat(cs.transitionDuration) > 0 || (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0);
        });
        if (!animated) return { pass: true, detail: 'nothing animates' };
        const css = [...ctx.doc.styleSheets].flatMap(s => { try { return [...s.cssRules].map(r => r.cssText); } catch { return []; } }).join('\n');
        return /prefers-reduced-motion/.test(css)
          ? { pass: true, detail: 'has a reduced-motion rule' }
          : { pass: false, detail: 'animates with no reduced-motion rule' };
      },
    },
  ];

  /* ---- Rules per core library ------------------------------------------------------------ */
  /* Each library's rules are read from its own pages (cited by source id). Rules without a
     `check` are listed as "Review": they matter, but only a person can judge them. */

  /** Apple sizes in pt (1pt ≈ 1 CSS px here): the recommended control size, the floor, and the text minimum. */
  const APPLE = {
    ios:      { rec: 44, floor: 28, text: 11 },
    macos:    { rec: 28, floor: 20, text: 10 },
    visionos: { rec: 60, floor: 28, text: 12 },
  };
  const applePlatform = ctx => APPLE[ctx.concept?.platform] ?? APPLE.ios;

  /** Controls below `floor` fail; between `floor` and `rec` they are flagged for review. */
  function sizeBands(ctx, rec, floor, noun) {
    const small = [], mid = [], all = ctx.els();
    for (const el of all) {
      const r = el.getBoundingClientRect(), m = Math.min(r.width, r.height);
      if (m < floor - 0.5) small.push(`${ctx.label(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
      else if (m < rec - 0.5) mid.push(`${ctx.label(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    if (small.length) return { pass: false, detail: `${small.length} of ${all.length} ${noun} under ${floor}`, items: small };
    if (mid.length) return { pass: 'review', detail: `${mid.length} of ${all.length} ${noun} between ${floor} and ${rec}`, items: mid };
    return { pass: true, detail: `${all.length} ${noun} at ${rec} or more` };
  }

  const reduceMotion = universal.find(r => r.id === 'wcag-motion').check;

  const systems = {
    'apple-hig': [
      {
        id: 'apple-hit',
        text: 'Buttons have a hit region of at least 44 × 44 pt on iOS (28 on macOS). Below the platform floor fails; between floor and recommended is for review.',
        source: 'hig-buttons',
        check: ctx => { const p = applePlatform(ctx); return sizeBands(ctx, p.rec, p.floor, 'controls'); },
      },
      {
        id: 'apple-text-min',
        text: 'Text is at least the platform minimum: 11 pt on iOS, 10 pt on macOS, 12 pt on visionOS.',
        source: 'hig-accessibility',
        check(ctx) {
          const min = applePlatform(ctx).text, els = ctx.textEls();
          const bad = els.filter(el => parseFloat(ctx.win.getComputedStyle(el).fontSize) < min - 0.01).map(el => `${ctx.label(el)} ${ctx.win.getComputedStyle(el).fontSize}`);
          return verdict(bad, els.length, `text runs under ${min}px`);
        },
      },
      {
        id: 'apple-contrast',
        text: 'Text has 4.5:1 contrast, or 3:1 at 18 pt and larger or in bold.',
        source: 'hig-accessibility',
        check(ctx) {
          const bad = []; let n = 0, guess = 0;
          for (const el of ctx.textEls()) {
            const c = ctx.contrast(el); if (!c) { guess++; continue; }
            n++;
            const cs = ctx.win.getComputedStyle(el), big = parseFloat(cs.fontSize) >= 18 || parseInt(cs.fontWeight, 10) >= 700;
            if (c.ratio < (big ? 3 : 4.5)) bad.push(`${ctx.label(el)} ${c.ratio.toFixed(1)}:1`);
          }
          if (bad.length) return { pass: false, detail: `${bad.length} of ${n} text runs`, items: bad };
          if (guess) return { pass: 'review', detail: `${n} measured; ${guess} sit on a gradient, image or blur` };
          return { pass: true, detail: `${n} text runs measured` };
        },
      },
      {
        id: 'apple-press',
        text: 'A custom button has a pressed state.',
        source: 'hig-buttons',
        check(ctx) {
          const css = [...ctx.doc.styleSheets].flatMap(s => { try { return [...s.cssRules].map(r => r.cssText); } catch { return []; } }).join('\n');
          return /:active/.test(css) ? { pass: true, detail: 'has an :active rule' } : { pass: false, detail: 'no :active rule found' };
        },
      },
      { id: 'apple-reduce-motion', text: 'Respond to Reduce Motion by cutting automatic and repetitive animation.', source: 'hig-accessibility', check: reduceMotion },
      { id: 'apple-prominent', text: 'One or two prominent (filled) buttons per view; use style, not size, to rank choices.', source: 'hig-buttons' },
      { id: 'apple-labels', text: 'Labels use title-style capitalization and start with a verb; alert buttons are one or two words.', source: 'hig-buttons' },
      { id: 'apple-destructive', text: 'A destructive button is red and never the primary role; a destructive alert includes Cancel.', source: 'hig-alerts' },
      { id: 'apple-alert-order', text: 'In an alert the default sits trailing in a row or on top in a stack, Cancel leading or at the bottom, at most three buttons.', source: 'hig-alerts' },
      { id: 'apple-one-accent', text: 'Color the background of the primary action, not many controls.', source: 'hig-color' },
      { id: 'apple-icons', text: 'Icons are familiar for their action and every icon-only control has a text label.', source: 'hig-icons' },
      { id: 'apple-glass', text: 'Liquid Glass is for controls and navigation, used sparingly, never over the content itself.', source: 'hig-materials' },
    ],
    'material-3': [
      {
        id: 'm3-target',
        text: 'Targets are at least 48 × 48 dp; a 40 dp visible element is fine inside a 48 dp target.',
        source: 'm3-density',
        check: ctx => sizeBands(ctx, 48, 40, 'controls'),
      },
    ],
  };

  window.RULES = { universal, systems, makeContext };
})();
