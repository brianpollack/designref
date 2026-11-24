/**
 * catalog.js — the single source of truth for the library.
 *
 * Everything that lists pages reads from here: the home page, category pages,
 * the left navigation, page titles, prev/next links, and feature tags. Add a
 * category or concept here first, then create its HTML file (see CLAUDE.md or
 * scripts/new-concept.sh).
 *
 * Structure
 *   sections[]            Top-level groups ("Components", "Page Templates").
 *     id                  Folder name under the site root, e.g. "components".
 *     categories[]
 *       id                Folder name, e.g. "context-menus".
 *       title, summary    Shown on the home page and the category page.
 *       concepts[]        Empty or missing → the category is "planned" (shown dimmed).
 *         id              File name without .html, e.g. "right-click-menu".
 *         title, summary  One line each; the summary is the concept's elevator pitch.
 *         features[]      Keys into FEATURES below; rendered as tags with links.
 *
 * URL rules (relative to the site root)
 *   category page → <section.id>/<category.id>/index.html
 *   concept page  → <section.id>/<category.id>/<concept.id>.html
 *
 * Loaded as a classic script (not JSON) because pages are opened from file://,
 * where fetch() is blocked.
 */
window.CATALOG = {
  title: 'Design Research',

  /** Glossary of platform features referenced by concepts. `url` is the best reference. */
  FEATURES: {
    'popover':            { name: 'Popover API',          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Popover_API' },
    'popover-hint':       { name: 'popover="hint"',       url: 'https://developer.chrome.com/blog/popover-hint' },
    'anchor-positioning': { name: 'Anchor positioning',   url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning' },
    'position-try':       { name: 'position-try-fallbacks', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks' },
    'invoker-commands':   { name: 'Invoker commands',     url: 'https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API' },
    'interest-invokers':  { name: 'Interest invokers',    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers' },
    'focusgroup':         { name: 'focusgroup',           url: 'https://developer.chrome.com/docs/modern-web-guidance/guides/ui-components/menu' },
    'starting-style':     { name: '@starting-style',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style' },
    'light-dark':         { name: 'light-dark()',         url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark' },
    'color-mix':          { name: 'color-mix()',          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix' },
    'has':                { name: ':has()',               url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has' },
    'backdrop-filter':    { name: 'backdrop-filter',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter' },
    'corner-shape':       { name: 'corner-shape',         url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape' },
    'trig-functions':     { name: 'sin() / cos()',        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/sin' },
    'sibling-index':      { name: 'sibling-index()',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/sibling-index' },
    'clip-path':          { name: 'clip-path',            url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path' },
    'dialog':             { name: '<dialog>',             url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog' },
    'closedby':           { name: 'closedby',             url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog#closedby' },
    'view-transitions':   { name: 'View transitions',     url: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API' },
    'field-sizing':       { name: 'field-sizing',         url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing' },
    'highlight-api':      { name: 'Custom Highlight API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API' },
    'anchored-queries':   { name: 'Anchored container queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/container-type' },
  },

  sections: [
    {
      id: 'components',
      title: 'Components',
      categories: [
        { id: 'accordions', title: 'Accordions & Disclosure' },
        { id: 'avatars', title: 'Avatars & Presence' },
        { id: 'badges-chips', title: 'Badges & Chips' },
        { id: 'breadcrumbs', title: 'Breadcrumbs' },
        { id: 'buttons', title: 'Buttons & Split Buttons' },
        { id: 'cards', title: 'Cards' },
        { id: 'carousels', title: 'Carousels' },
        { id: 'checkboxes-switches', title: 'Checkboxes, Radios & Switches' },
        { id: 'combobox', title: 'Combobox & Autocomplete' },
        { id: 'command-palettes', title: 'Command Palettes' },
        {
          id: 'context-menus',
          title: 'Context Menus',
          summary: 'Menus that appear where the user is working: at the pointer, on a row, under a long press.',
          concepts: [
            {
              id: 'right-click-menu',
              title: 'Right-Click Menu',
              summary: 'The desktop staple. Opens at the pointer, flips at the viewport edge, arrow keys work with no script.',
              features: ['popover', 'anchor-positioning', 'position-try', 'anchored-queries', 'focusgroup', 'starting-style', 'light-dark'],
            },
            {
              id: 'overflow-menu',
              title: 'Overflow Action Menu',
              summary: 'A ⋯ button that opens row actions. Opening, placement, focus and closing are all declarative: zero JavaScript.',
              features: ['invoker-commands', 'popover', 'anchor-positioning', 'focusgroup'],
            },
            {
              id: 'cascading-submenus',
              title: 'Cascading Submenus',
              summary: 'Nested menus that open on hover or arrow key, with a CSS safe triangle so diagonal pointer paths keep them open.',
              features: ['interest-invokers', 'popover', 'anchor-positioning', 'position-try', 'clip-path', 'focusgroup'],
            },
            {
              id: 'material-3-expressive',
              title: 'Material 3 Expressive Menu',
              summary: 'Google’s vertical menu: grouped segments with 2dp gaps, rounded selection, standard and vibrant color styles.',
              features: ['invoker-commands', 'popover', 'anchor-positioning', 'focusgroup', 'starting-style', 'light-dark'],
            },
            {
              id: 'glass-menu',
              title: 'Glass Menu',
              summary: 'A translucent vibrancy menu in the spirit of Apple’s Liquid Glass: blurred backdrop, squircle corners, lit edge.',
              features: ['backdrop-filter', 'corner-shape', 'popover', 'anchor-positioning', 'light-dark'],
            },
            {
              id: 'radial-menu',
              title: 'Radial Menu',
              summary: 'A pie menu for canvas tools. Items are placed with CSS trigonometry and picked by pointer direction.',
              features: ['trig-functions', 'sibling-index', 'popover', 'anchor-positioning'],
            },
            {
              id: 'long-press-preview',
              title: 'Long-Press Preview',
              summary: 'Touch first. Press and hold a card to lift a preview with its actions beneath, the page blurred behind.',
              features: ['dialog', 'closedby', 'backdrop-filter', 'anchor-positioning', 'position-try', 'starting-style'],
            },
            {
              id: 'filterable-menu',
              title: 'Filterable Command Menu',
              summary: 'A right-click menu you can type into. Matches filter live and empty groups hide themselves with :has().',
              features: ['popover', 'anchor-positioning', 'has', 'highlight-api'],
            },
          ],
        },
        { id: 'data-tables', title: 'Data Tables' },
        { id: 'date-pickers', title: 'Date Pickers & Calendars' },
        { id: 'dialogs', title: 'Dialogs & Modals' },
        { id: 'drawers-sheets', title: 'Drawers & Sheets' },
        { id: 'dropdown-menus', title: 'Dropdown Menus & Menu Bars' },
        { id: 'empty-states', title: 'Empty States' },
        { id: 'file-upload', title: 'File Upload & Dropzones' },
        { id: 'hover-cards', title: 'Hover Cards' },
        { id: 'inputs', title: 'Text Fields & Inputs' },
        { id: 'navigation', title: 'Navigation Bars & Sidebars' },
        { id: 'pagination', title: 'Pagination' },
        { id: 'progress', title: 'Progress, Loaders & Skeletons' },
        { id: 'segmented-controls', title: 'Segmented Controls' },
        { id: 'selects', title: 'Selects' },
        { id: 'sliders', title: 'Range Sliders' },
        { id: 'splitters', title: 'Splitters & Resizable Panes' },
        { id: 'steppers', title: 'Steppers' },
        { id: 'tabs', title: 'Tabs' },
        { id: 'toasts', title: 'Toasts & Notifications' },
        { id: 'toolbars', title: 'Toolbars' },
        { id: 'tooltips', title: 'Tooltips' },
        { id: 'tree-views', title: 'Tree Views' },
      ],
    },
    {
      id: 'templates',
      title: 'Page Templates',
      categories: [
        { id: 'admin-dashboard', title: 'Admin Dashboard' },
        { id: 'analytics', title: 'Analytics & Reporting' },
        { id: 'auth', title: 'Sign In & Sign Up' },
        { id: 'calendar', title: 'Calendar & Scheduling' },
        { id: 'changelog', title: 'Changelog' },
        { id: 'checkout', title: 'Checkout' },
        { id: 'docs', title: 'Documentation' },
        { id: 'editor', title: 'Editor & Canvas' },
        { id: 'error-pages', title: 'Error Pages' },
        { id: 'file-manager', title: 'File Manager' },
        { id: 'inbox', title: 'Inbox & Messaging' },
        { id: 'kanban', title: 'Kanban Board' },
        { id: 'landing', title: 'Landing Page' },
        { id: 'list-detail', title: 'List & Detail' },
        { id: 'onboarding', title: 'Onboarding' },
        { id: 'pricing', title: 'Pricing' },
        { id: 'profile', title: 'Profile & Account' },
        { id: 'search-results', title: 'Search Results' },
        { id: 'settings', title: 'Settings' },
      ],
    },
  ],
};
