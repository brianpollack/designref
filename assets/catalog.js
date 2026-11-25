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
 *         icons           Optional icon library id (icon-libraries.js) the demo draws from;
 *                         default 'lucide'. Built-to-spec concepts use their library's own set.
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
    'scroll-target-group': { name: 'scroll-target-group', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-target-group' },
    'content-visibility': { name: 'content-visibility',   url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility' },
    'overflow-anchor':    { name: 'overflow-anchor',      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor' },
    'aria-log':           { name: 'role="log"',           url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/log_role' },
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
            system: 'material-3', icons: 'material-symbols',
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
            system: 'fluent-2', icons: 'fluent-system-icons',
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
            system: 'carbon', icons: 'carbon-icons',
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
        {
          id: 'tabs',
          title: 'Tabs & Tabbed Navigation',
          summary: 'One row of labels, one visible panel. Tabs switch views in place; the same markup can also navigate a long page.',
          specs: { 'material-3': 'm3-tabs', 'apple-hig': 'hig-tab-bars', 'fluent-2': 'fluent-tablist', 'carbon': 'carbon-tabs' },
          refs: [
            ['apg-tabs'],
            ['mdn-tab-role'],
            ['m3-tabs'],
            ['fluent-tablist'],
            ['carbon-tabs'],
            ['hig-tab-bars'],
          ],
          concepts: [
            {
              id: 'underline-tabs',
              title: 'Underline Tabs',
              summary: 'The standard tablist. One indicator slides between tabs, placed by anchor positioning; arrow keys move and select.',
              features: ['anchor-positioning', 'has', 'light-dark'],
              refs: [
                ['apg-tabs', 'roles and states, roving <code>tabindex</code>, arrow keys with wrapping, <kbd>Home</kbd> and <kbd>End</kbd>, and automatic activation when panels show instantly.'],
                ['mdn-tab-role', '<code>aria-selected</code> and <code>aria-controls</code>, and why a tab is a button that controls a panel.'],
                ['fluent-tab-indicator', 'one indicator element animated between tabs instead of one underline per tab.'],
                ['mdn-position-area', 'the anchor functions that size the indicator to the selected tab.'],
              ],
            },
            {
              id: 'scroll-spy-tabs',
              title: 'Scroll-Spy Tabs',
              summary: 'Tabs that navigate one long page. The browser marks the tab for the section in view: no scroll listener, no script.',
              features: ['scroll-target-group', 'anchor-positioning', 'light-dark'],
              refs: [
                ['mdn-scroll-target-group', '<code>scroll-target-group: auto</code> on the tab container makes each in-page link a scroll marker.'],
                ['mdn-target-current', '<code>:target-current</code> matches the link whose section is in view.'],
                ['apg-tabs', 'where this differs: these are links to sections, so the tab roles do not apply.'],
              ],
            },
            {
              id: 'material-3-tabs',
              title: 'Material 3 Tabs',
              summary: 'Google’s tab row: primary tabs with a 3px rounded indicator under the label, secondary tabs with a full-width underline.',
              features: ['anchor-positioning', 'has', 'light-dark'],
              system: 'material-3', icons: 'material-symbols',
              refs: [
                ['m3-tabs', 'primary and secondary tabs, when to use each, and badges.'],
                [['compose-primary-tab-tokens', 'compose-secondary-tab-tokens'], 'every height, indicator, type and color role on this page.'],
                ['compose-tabrow', 'the indicator is at least 24dp wide and tracks the label, the divider sits under the row, and scrollable rows use a 90dp minimum tab and 52dp start padding.'],
                [['compose-color-light-tokens', 'compose-color-dark-tokens', 'compose-palette-tokens'], 'which role maps to which tone, and the tone values.'],
              ],
            },
            {
              id: 'fluent-2-tab-list',
              title: 'Fluent 2 Tab List',
              summary: 'Microsoft’s tab list: a 3px rounded brand indicator that slides, hover pill under the label, bold selected text.',
              features: ['anchor-positioning', 'has', 'light-dark'],
              system: 'fluent-2', icons: 'fluent-system-icons',
              refs: [
                ['fluent-tablist', 'when to use tabs, transparent and subtle appearances, and sizes.'],
                ['fluent-tab-styles', 'padding by size, the indicator geometry, hover and pressed colors, and the focus ring.'],
                ['fluent-tablist-styles', 'a row with no gap for the line appearance.'],
                ['fluent-tab-indicator', 'one indicator translated and scaled between tabs over 300ms.'],
                [['fluent-grey-colors', 'fluent-light-color', 'fluent-dark-color', 'fluent-brand-colors'], 'every color on this page, resolved to the web brand and grey ramps.'],
                [['fluent-durations', 'fluent-curves'], 'the 300ms duration and the decelerate curve.'],
                ['fluent-shadows', 'shadow4, half of the keyboard focus ring.'],
              ],
            },
            {
              id: 'carbon-tabs',
              title: 'Carbon Tabs',
              summary: 'IBM’s tabs: a line variant with a 2px underline and a contained variant of gray blocks, in three heights.',
              features: ['has', 'light-dark'],
              system: 'carbon', icons: 'carbon-icons',
              refs: [
                ['carbon-tabs', 'line and contained variants, and when to use each.'],
                [['carbon-tabs-scss', 'carbon-tabs-vars'], 'every size, border, hover and selected state, including the 2px underline colors.'],
                ['carbon-tabs-tsx', 'roles, selected tab in the tab order, arrow, <kbd>Home</kbd> and <kbd>End</kbd> keys, and automatic or manual activation.'],
                ['carbon-layout-scss', 'row heights 32, 40 and 48px and the 16px inline padding.'],
                [['carbon-white-theme', 'carbon-g100-theme', 'carbon-colors-tokens'], 'which tokens a tab resolves to, and the gray and blue values.'],
                ['carbon-focus-outline', 'the inset 2px outline.'],
              ],
            },
          ],
        },
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
        {
          id: 'chat',
          title: 'Chat & Messaging',
          summary: 'People talking in a channel, a room, a call or one to one: messages from someone to someone, with reactions, links, replies and a place to type and send.',
          specs: { 'material-3': 'android-m3-components', 'apple-hig': 'hig-text-fields', 'fluent-2': 'fluent-chat-message', 'carbon': 'carbon-ai-chat' },
          refs: [
            ['slack-keyboard-nav', 'Message-by-message keyboard navigation and the regions of a chat window.'],
            ['discord-message', 'What a message carries: edits, replies, threads, reactions, embeds, limits.'],
            ['matrix-client-api', 'The message model underneath: events, replies, threads, edits, reactions, receipts.'],
            [['mdn-role-log', 'mdn-live-regions'], 'role="log" and live regions for a live message list.'],
            [['apg-feed', 'mdn-role-feed'], 'The feed pattern, and why a chat log is not a feed.'],
            ['slack-block-kit', 'Messages are built from blocks, but a screen reader reads only the top-level text.'],
            ['discord-reference', 'Mention, emoji and timestamp syntax a message body can carry.'],
          ],
          concepts: [
            {
              id: 'channel-chat',
              title: 'Channel Chat',
              summary: 'One channel’s messages: flat rows grouped by sender, with reactions, link previews, a thread link under each, and the composer.',
              features: ['aria-log', 'field-sizing', 'has', 'overflow-anchor', 'light-dark'],
              refs: [
                ['slack-screen-reader', 'Each message is read as a summary on focus, and Up from the composer moves to the latest message.'],
                [['slack-keyboard-nav', 'slack-shortcuts', 'discord-keyboard-nav'], 'Up and Down between messages; Esc and F6 between regions; unread and reaction keys.'],
                ['slack-threads', 'A thread opens in a panel beside the channel; replies can also go to the channel.'],
                ['slack-edit-delete', 'Hover actions on a message, and edit and delete.'],
                [['mdn-overflow-anchor', 'mdn-content-visibility'], 'Keeping the scroll position while history loads above; skipping off-screen messages.'],
                ['mdn-flex-direction', 'Why the list is not column-reverse: it splits visual order from DOM order.'],
              ],
            },
            {
              id: 'direct-messages',
              title: 'Direct Message Bubbles',
              summary: 'One person to another. Bubbles align to a side, group by sender with :has(), and end with a delivery status.',
              features: ['aria-log', 'field-sizing', 'has', 'light-dark'],
              refs: [
                ['teams-send-read', 'Hover your own message to edit or delete; reactions sit at the message corner.'],
                ['teams-reactions', 'Reactions show just below the message, up to 20 per message.'],
                ['matrix-client-api', 'Read receipts and typing notifications as separate, ephemeral signals.'],
                ['mdn-role-log', 'A live list with an implicit polite announcement.'],
              ],
            },
            {
              id: 'message-composer',
              title: 'Message Composer',
              summary: 'The place to type: a box that grows, formatting, @mentions in a combobox, emoji, attachments, and a send button that knows when it can send.',
              features: ['field-sizing', 'popover', 'anchor-positioning', 'has', 'light-dark'],
              refs: [
                ['slack-formatting', 'Toolbar contents, Shift+Enter for a new line, list triggers typed as text.'],
                ['discord-shortcuts', 'Emoji, GIF and attach as keyboard shortcuts; Up to edit the last message.'],
                ['discord-markdown', 'Markdown typed in the box as the formatting fallback.'],
                ['gchat-formatting', 'Toolbar and markdown equivalents; live markdown can be turned off.'],
                ['gchat-replying', 'Drafts saved after a pause in typing.'],
                ['teams-shortcuts', 'Enter and Shift+Enter, expanded compose, formatting keys.'],
                ['apg-combobox', 'The mention list: focus stays in the input, aria-activedescendant names the option.'],
                ['mdn-field-sizing', 'A textarea that grows with its content, with min and max.'],
              ],
            },
            {
              id: 'meeting-chat',
              title: 'Meeting Chat Panel',
              summary: 'Chat beside a video call: ephemeral, for everyone present, dense, and switched off by the host when it must be.',
              features: ['aria-log', 'field-sizing', 'light-dark'],
              refs: [
                ['meet-chat', 'Where the panel opens, who sees messages, persistence, host control, pinning.'],
                ['gchat-threads', 'The persistent counterpart: space threads in a right-hand panel.'],
              ],
            },
            {
              id: 'fluent-2-teams-chat',
              title: 'Fluent 2 Teams Chat',
              summary: 'A Teams-style chat to Fluent 2’s own values: 4px bubbles, brand-tinted own messages, status icons, pill reactions.',
              system: 'fluent-2', icons: 'fluent-system-icons',
              features: ['aria-log', 'field-sizing', 'has', 'light-dark'],
              refs: [
                [['fluent-chat-message', 'fluent-chat-my-message', 'fluent-chat-mixins'], 'Bubble, padding, radius, row gaps, name line, status icons and body type from the Chat components used in Teams.'],
                ['fluent-chat-reactions-story', 'The reaction pill: 26px high, 13px radius, 12px text, 1px Stroke2.'],
                [['fluent-teams-dark', 'fluent-light-color', 'fluent-brand-colors'], 'Teams dark neutrals and the brandTeams ramp, resolved by step index.'],
                [['fluent-avatar-styles', 'fluent-textarea-styles', 'fluent-divider-styles', 'fluent-button-styles', 'fluent-radius-spacing'], 'Avatar 32px, Textarea, Divider with text, subtle icon Button, radius and spacing scales.'],
                ['fluent-shadows', 'Elevation of the hover toolbar.'],
                [['teams-reactions', 'teams-mentions', 'teams-mark-unread'], 'Reactions below the message, @mentions, bold unread with a count.'],
                ['teams-shortcuts', 'Compose and message-pane keys.'],
              ],
            },
            {
              id: 'matrix-room',
              title: 'Matrix Room',
              summary: 'Element’s modern layout on Compound tokens, with the agent-in-the-room additions of MindRoom: streamed edits, tool traces and approval cards.',
              features: ['aria-log', 'field-sizing', 'has', 'light-dark'],
              refs: [
                [['element-event-tile', 'element-profile', 'element-timestamp'], 'Tile padding, the 64px gutter, avatar slot, name and timestamp type.'],
                [['element-action-bar', 'element-reactions', 'element-thread-summary', 'element-read-marker'], 'Hover bar, reaction pills, thread summary, and the new-messages line.'],
                [['element-composer', 'element-room-header'], 'Composer height and room header.'],
                [['compound-base', 'compound-semantic', 'compound-light', 'compound-dark'], 'Type, spacing and the light and dark colors.'],
                ['matrix-client-api', 'Event types, relations (reply, thread, edit, reaction) and receipts.'],
                [['mindroom-readme', 'mindroom-chat'], 'Agents as room members: streaming edits, tool traces, approval cards, thread views.'],
              ],
            },
          ],
        },
        { id: 'checkout', title: 'Checkout' },
        { id: 'docs', title: 'Documentation' },
        { id: 'editor', title: 'Editor & Canvas' },
        { id: 'error-pages', title: 'Error Pages' },
        { id: 'file-manager', title: 'File Manager' },
        { id: 'inbox', title: 'Inbox & Email' },
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
