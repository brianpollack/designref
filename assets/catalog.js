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
 *         system          Optional id of the core library (sources.js → systems) this concept
 *                         is built to. Add `inspired: true` when it follows that library's look
 *                         and guidance but the values are our own.
 *         refs[]          Citations, rendered as the page's Sources section. Each is
 *                         [pageId, note]: pageId (or an array of ids sharing one note) is a key
 *                         of SOURCES.pages; the note says what the page contributed (HTML allowed).
 *       refs[]            Category-level citations, same shape (the note may be omitted).
 *       specs             { systemId: pageId } each core library's own page for this component;
 *                         renders the "Core libraries" table on the category page and the
 *                         coverage table on sources.html.
 *
 * URL rules (relative to the site root)
 *   category page → <section.id>/<category.id>/index.html
 *   concept page  → <section.id>/<category.id>/<concept.id>.html
 *
 * Loaded as a classic script (not JSON) because pages are opened from file://,
 * where fetch() is blocked. Sources and core libraries live in assets/sources.js.
 */
window.CATALOG = {
  title: 'Design Research',

  /** Glossary of platform features referenced by concepts. `url` is the best reference. */
  FEATURES: {
    'popover':            { name: 'Popover API',          url: 'https://developer.mozilla.org/en-US/docs/Web/API/Popover_API' },
    'popover-hint':       { name: 'popover="hint"',       url: 'https://developer.chrome.com/blog/popover-hint' },
    'anchor-positioning': { name: 'Anchor positioning',   url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning' },
    'position-try':       { name: 'position-try-fallbacks', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks' },
    'invoker-commands':   { name: 'Invoker commands',     url: 'https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API' },
    'interest-invokers':  { name: 'Interest invokers',    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers' },
    'focusgroup':         { name: 'focusgroup',           url: 'https://developer.chrome.com/docs/modern-web-guidance/guides/ui-components/menu' },
    'starting-style':     { name: '@starting-style',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style' },
    'light-dark':         { name: 'light-dark()',         url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark' },
    'color-mix':          { name: 'color-mix()',          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix' },
    'has':                { name: ':has()',               url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has' },
    'backdrop-filter':    { name: 'backdrop-filter',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter' },
    'corner-shape':       { name: 'corner-shape',         url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape' },
    'trig-functions':     { name: 'sin() / cos()',        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sin' },
    'sibling-index':      { name: 'sibling-index()',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-index' },
    'clip-path':          { name: 'clip-path',            url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path' },
    'dialog':             { name: '<dialog>',             url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog' },
    'closedby':           { name: 'closedby',             url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby' },
    'view-transitions':   { name: 'View transitions',     url: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API' },
    'field-sizing':       { name: 'field-sizing',         url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing' },
    'highlight-api':      { name: 'Custom Highlight API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API' },
    'anchored-queries':   { name: 'Anchored container queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-type' },
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
          specs: { 'material-3': 'm3-menus', 'apple-hig': 'hig-context-menus', 'fluent-2': 'fluent-menu', 'carbon': 'carbon-menu' },
          refs: [
            ['chrome-menu'],
            ['master-popover-context-menus'],
            ['ics-safe-triangle'],
            ['m3-menus'],
            ['apg-menubar'],
          ],
          concepts: [
            {
              id: 'right-click-menu',
              title: 'Right-Click Menu',
              summary: 'The desktop staple. Opens at the pointer, flips at the viewport edge, arrow keys work with no script.',
              features: ['popover', 'anchor-positioning', 'position-try', 'anchored-queries', 'focusgroup', 'starting-style', 'light-dark'],
            refs: [
              ['chrome-menu', 'the zero-size placeholder anchor and <code>showPopover({ source })</code> for menus with no trigger.'],
              ['master-popover-context-menus', 'a popover placed at the pointer with anchor positioning.'],
              ['mdn-try-hiding', '<code>position-try-fallbacks</code> that flip the menu at the viewport edge.'],
            ],
            },
            {
              id: 'overflow-menu',
              title: 'Overflow Action Menu',
              summary: 'A ⋯ button that opens row actions. Opening, placement, focus and closing are all declarative: zero JavaScript.',
              features: ['invoker-commands', 'popover', 'anchor-positioning', 'focusgroup'],
            refs: [
              ['apg-menu-button', 'the keyboard contract measured against above.'],
              ['mdn-invoker-commands', '<code>commandfor</code>, <code>toggle-popover</code> and <code>hide-popover</code>.'],
              ['chrome-menu', '<code>focusgroup="menu"</code> on a container inside the popover, and implicit anchoring to the invoker.'],
              ['mdn-position-area', 'the spanning areas that align the menu to the trigger’s end edge.'],
            ],
            },
            {
              id: 'cascading-submenus',
              title: 'Cascading Submenus',
              summary: 'Nested menus that open on hover or arrow key, with a CSS safe triangle so diagonal pointer paths keep them open.',
              features: ['interest-invokers', 'popover', 'anchor-positioning', 'position-try', 'clip-path', 'focusgroup'],
            refs: [
              ['chrome-menu', 'nested popovers inside <code>focusgroup</code>, submenu placement with <code>position-try-fallbacks</code> and the below fallback, the focus rules, and the <code>clip-path</code> safe triangle with its pointer-tracking script.'],
              ['ics-safe-triangle', '<code>clip-path: polygon()</code> as the hit area, and <code>interestfor</code> beside a click invoker on the same popover for hover plus click.'],
              ['mdn-interest-invokers', '<code>interestfor</code> and the <code>interest-delay-start</code> / <code>interest-delay-end</code> properties used for hover intent.'],
              ['apg-menubar', 'submenu keys (<kbd>→</kbd> opens and enters, <kbd>←</kbd> and <kbd>Esc</kbd> close one level).'],
              ['kamens-mega-dropdown', 'why a direction-aware safe zone beats a fixed open delay.'],
            ],
            },
            {
              id: 'material-3-expressive',
              title: 'Material 3 Expressive Menu',
              summary: 'Google’s vertical menu: grouped segments with 2dp gaps, rounded selection, standard and vibrant color styles.',
              features: ['invoker-commands', 'popover', 'anchor-positioning', 'focusgroup', 'starting-style', 'light-dark'],
            system: 'material-3',
            refs: [
              ['m3-menus', 'anatomy, the vertical menu layouts and both color styles.'],
              ['9to5-m3e-menus', 'the gap guidance (one or two per menu), Vibrant “should be used sparingly”, inset selection and submenu shape morphing.'],
              [['compose-segmented-menu-tokens', 'compose-standard-menu-tokens', 'compose-vibrant-menu-tokens'], 'every size, shape and color role on this page, from the Jetpack Compose source.'],
              [['compose-menu', 'compose-menu-defaults'], 'group and item corners by position, the 80% open scale and which springs drive it.'],
              ['compose-expressive-motion', 'spring stiffness and damping behind the <code>linear()</code> curves.'],
              ['mweb-focus-ring', '3px width, 2px outer offset, 8px grow width, 600ms. Its menu items use the inward ring.'],
            ],
            },
            {
              id: 'fluent-2-menu',
              title: 'Fluent 2 Menu',
              summary: 'Microsoft’s menu from Fluent UI React v9: 32px rows, checkmark and icon columns, a brand-tinted icon on hover.',
              features: ['invoker-commands', 'popover', 'anchor-positioning', 'anchored-queries', 'focusgroup', 'has', 'starting-style', 'light-dark'],
            system: 'fluent-2',
            refs: [
              ['fluent-menu', 'when to use a menu, grouping with dividers and headers, and selectable items.'],
              [['fluent-menu-popover-styles', 'fluent-menu-list-styles'], 'the surface: 4px corners, 4px padding, 138–300px width, shadow16 and the 2px gap between items.'],
              ['fluent-menu-item-styles', 'item padding, height, columns, secondary content, and the hover, pressed and disabled colors.'],
              [['fluent-menu-divider-styles', 'fluent-menu-group-header-styles', 'fluent-checkmark-styles'], 'dividers that reach the surface edge, 32px group headers and the 16px checkmark slot.'],
              [['fluent-menu-motion', 'fluent-menu-hook'], 'the enter-only fade and 10px slide, and below-start placement.'],
              [['fluent-light-color', 'fluent-dark-color', 'fluent-brand-colors'], 'every color on this page, resolved to the web brand ramp.'],
              ['fluent-focus-outline', 'the 2px focus outline with 4px corners.'],
            ],
            },
            {
              id: 'carbon-menu',
              title: 'Carbon Menu',
              summary: 'IBM’s context menu: square corners, 16px icons, four row heights, and a danger item that fills red on focus.',
              features: ['popover', 'anchor-positioning', 'position-try', 'focusgroup', 'has', 'light-dark'],
            system: 'carbon',
            refs: [
              ['carbon-menu', 'when to use a menu, sizes, selectable items and danger actions.'],
              ['carbon-menu-scss', 'every size, space and state on this page, including the danger focus ring.'],
              [['carbon-menu-tsx', 'carbon-menu-item-tsx'], 'roles, the sm default size, wrapping arrow keys, and closing on <kbd>Esc</kbd> or <kbd>Tab</kbd>.'],
              [['carbon-layer-sets', 'carbon-white-theme', 'carbon-g100-theme'], 'which layer tokens a menu resolves to, and their White and Gray 100 values.'],
              ['carbon-focus-outline', 'the inset 2px outline and its dotted form under <code>prefers-contrast</code>.'],
              ['chrome-menu', 'the zero-size anchor and <code>showPopover({ source })</code> for a menu opened at the pointer.'],
            ],
            },
            {
              id: 'glass-menu',
              title: 'Glass Menu',
              summary: 'A translucent vibrancy menu in the spirit of Apple’s Liquid Glass: blurred backdrop, squircle corners, lit edge.',
              features: ['backdrop-filter', 'corner-shape', 'popover', 'anchor-positioning', 'light-dark'],
            system: 'apple-hig', inspired: true,
            refs: [
              ['apple-liquid-glass', 'Liquid Glass as a translucent material that reflects and refracts what is behind it.'],
              ['hig-materials', 'Liquid Glass and vibrancy, and keeping text legible on translucent surfaces.'],
              ['hig-menus', 'shortcuts, check marks, destructive items and grouping.'],
              [['mdn-backdrop-filter', 'mdn-corner-shape'], 'the blur and the squircle corners.'],
              ['mdn-reduced-transparency', 'the opaque fallback.'],
              ['chrome-menu', 'the zero-size anchor and <code>showPopover({ source })</code> for menus with no trigger.'],
            ],
            },
            {
              id: 'radial-menu',
              title: 'Radial Menu',
              summary: 'A pie menu for canvas tools. Items are placed with CSS trigonometry and picked by pointer direction.',
              features: ['trig-functions', 'sibling-index', 'popover', 'anchor-positioning'],
            refs: [
              ['una-radial-menu', 'polar placement with <code>sin()</code>/<code>cos()</code> and a flipped y axis, per-item delays, and popover for <kbd>Esc</kbd> and light dismiss.'],
              ['webdev-trig', 'placing items on a circle and <code>atan2()</code> for the angle toward the pointer.'],
              ['chrome-sibling-styling', 'angle from <code>sibling-index()</code> / <code>sibling-count()</code>, so adding an item re-spaces the ring with no edits.'],
              ['blender-pie-menus', 'press, move, release to pick; releasing without moving keeps it open; the center disc shows direction and is the dead zone; number keys.'],
            ],
            },
            {
              id: 'long-press-preview',
              title: 'Long-Press Preview',
              summary: 'Touch first. Press and hold a card to lift a preview with its actions beneath, the page blurred behind.',
              features: ['dialog', 'closedby', 'backdrop-filter', 'anchor-positioning', 'position-try', 'starting-style'],
            system: 'apple-hig', inspired: true,
            refs: [
              ['hig-context-menus', 'a short list of relevant items, about three groups at most, destructive items last in red, a preview that emerges from the content while the screen dims, and every item also available in the main interface.'],
              ['mdn-closedby', '<code>any</code> adds light dismiss to the close request (<kbd>Esc</kbd>) a modal dialog gets by default.'],
              ['mdn-try-hiding', '<code>position-try-fallbacks</code> with <code>flip-block</code> and <code>flip-inline</code>, which also swap the margins used here as screen-edge insets.'],
            ],
            },
            {
              id: 'filterable-menu',
              title: 'Filterable Command Menu',
              summary: 'A right-click menu you can type into. Matches filter live and empty groups hide themselves with :has().',
              features: ['popover', 'anchor-positioning', 'has', 'highlight-api'],
            refs: [
              ['apg-combobox', 'the roles and keys for a field that drives a listbox.'],
              ['mdn-highlight-api', '<code>Highlight</code>, <code>CSS.highlights</code> and <code>::highlight()</code>.'],
              ['cmdk', 'grouped command lists with a filter field, the structure most React command menus share.'],
              ['raycast-action-panel', 'sections of actions with shortcuts behind a search field.'],
              ['mdn-aria-active-descendant', 'pointing at the active option without ids.'],
            ],
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
