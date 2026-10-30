# Squeek Radar design system

## Overview

Squeek Radar is a playful community dashboard for Squeekchain, a hamster-powered toychain on Ethereum. A pixel hamster in a blue wheel carries the visual idea. The surrounding dashboard uses calm gray surfaces, blue controls, compact data, and generous spacing. Wheel activity is explicitly a browser-local simulation; the separate Sepolia feed identifies live snapshots and sample activity.

The implemented sources are `src/styles.css`, `src/main.tsx`, `src/Hamster.tsx`, and `src/icons.tsx`. The dashboard uses a two-column control area, ecosystem cards, a three-step journey, and a transaction feed. The About page reuses the same navigation, surfaces, type, and link styles.

## Colors

All interface colors originate in the `:root` block in `src/styles.css`. Components use semantic roles backed by these primitives:

| Semantic token | Value | Role |
| --- | --- | --- |
| `--color-page` | `#f5f6f9` | Page canvas |
| `--color-surface` | `#ffffff` | Header, panels, dialogs, button text |
| `--color-text` | `#202a3d` | Headings, values, primary text |
| `--color-muted` | `#525e73` | Descriptions and secondary labels |
| `--color-subtle` | `#667085` | Secondary icons and numeric suffixes |
| `--color-border` | `#e0e5ed` | Panel outlines and structural dividers |
| `--color-accent` | `#335cff` | Main action, work progress, brand emphasis |
| `--color-accent-hover` | `#2348d4` | Hovered primary action, navigation, links |
| `--color-tint` | `#edf2ff` | Wheel room and light interactive states |
| `--color-tint-strong` | `#e1e9ff` | Selected journey icon and hover fill |
| `--color-tint-border` | `#c4d3ff` | Wheel outline and focus-related surfaces |
| `--color-success` | `#25714b` | Confirmed transactions and network dot |
| `--color-success-bg` | `#e9f5ee` | Live-data badge |
| `--color-error` | `#ab3546` | Failed transaction text |
| `--color-focus` | `#2348d4` | 3px focus outline, offset 4px |

Artwork has its own fixed palette: brown outlines, tan fur, cream cheeks, pink nose, and blue wheel parts in `src/Hamster.tsx`. These are illustration colors, not additional interface status roles. Status always includes text or an icon. There is one light theme. Rendered solid-background text contrast was checked by the pinned probe; see `artifacts/validation.md` for scope and limitations.

## Typography

Fonts are local WOFF2 assets in `public/fonts/`, copied into the export. DM Sans is a variable face declared for weights 100–1000; the interface uses only 400, 600, and 700. Silkscreen has its real 400 face. Both font licenses are included alongside the files.

| Token | Size | Use |
| --- | --- | --- |
| `--text-caption` | 12px / `.75rem` | Metadata, transaction rows, helper text |
| `--text-small` | 14px / `.875rem` | Controls, descriptions, navigation |
| `--text-body` | 16px / `1rem` | Body copy and dashboard section headings |
| `--text-section` | 20px / `1.25rem` | About headings, card values, wheel numerals |
| `--text-number` | 32px / `2rem` | Narrow-screen hero and work percentage |
| `--text-display` | 48px / `3rem` | Desktop hero and work percentage |

`--font-body` is `'DM Sans', sans-serif`. `--font-pixel` is `'Silkscreen', monospace`, reserved for wheel numerals and the About mascot label. `--font-data` is a system monospace stack for transaction IDs, hashes, and values. Prose stays in DM Sans.

Body line-height is 1.5; About prose uses 1.7, or 1.65 below 688px, with a 65ch maximum measure. The main heading uses 1.15 line-height and tracking from −.05em on desktop to −.04em at narrower widths. Other headings use 1.35 and −.025em or −.015em. Headings balance their wrapping. Changing numbers use tabular figures. Complete hashes wrap with `overflow-wrap: anywhere` in the details dialog; shortened feed hashes always open that full view.

## Layout

The spacing tokens are 4, 8, 12, 16, 20, 24, 32, 40, and 48px. Main panels share content edges, with 24px desktop gutters and 20px or 16px at narrower widths. The page shell has a 1280px maximum including 32px inline padding; the header has a 1344px maximum. Footer content aligns with the page interior.

The content-driven breakpoints in `src/styles.css` are:

| Maximum width | Adaptation |
| --- | --- |
| 72rem / 1152px | Remove supplementary intro link; tighten cards and controls |
| 58rem / 928px | Equal control columns; ecosystem becomes two columns; journey stacks; hide feed time column |
| 43rem / 688px | Single control column; 20px page gutters; compact header; transaction buttons become two-line rows; About becomes one column |
| 23rem / 368px | 16px gutters, tighter navigation, wrap status-card metadata, remove decorative row icons |

The 390px hero wraps to two lines. The wheel and its primary action precede the work panel in both DOM and visual order. The primary action is visible without scrolling at 390 × 844. The share control remains available at 320px. Row details expose timestamps and full hashes when compact layouts hide table columns. Screenshots and automated reflow checks cover 320, 390, 768, 1024, and 1440px; this does not establish physical-device behavior.

## Elevation & Depth

The site is deliberately flat. Panels use a 1px border and no shadow. The wheel uses a tinted background to distinguish its interactive scene. No gradient text, raised-card stack, or decorative shadow system exists. Native dialogs use a `#202a3d99` backdrop to establish a separate interaction layer.

## Shapes

Panel radius is 14px; standard controls use 8px. Badges use 5px; small icon tiles use 7px; journey tiles use 10px. Dialogs use 16px with 24px padding, reduced to 20px on narrow screens. Wheel tread and hamster paths are inline SVG. The hamster uses crisp square pixels; the wheel is circular. Reuse that contrast instead of turning every surface into pixel art.

## Components

- **Navigation:** `App` in `src/main.tsx` uses hash links, `aria-current`, an underline for the current page, a home logo, and one share control. Route changes focus the new page heading. The skip link moves focus to `main` without changing the route.
- **Buttons:** `.button-primary`, `.button-secondary`, `.icon-button`, and `.text-button` in `src/styles.css`. The blue fill identifies the main action. Controls support hover, focus, pressed, and native disabled states. Main actions are at least 44px tall. Secondary utility targets meet the 24px baseline but some are smaller than 44px.
- **Hamster and wheel:** `HamsterPixels`, `HamsterMark`, and `WheelScene` in `src/Hamster.tsx`. `WheelScene` accepts `paused` and `boosted`; its accessible title and description identify the simulation. The normal wheel rotates every 5 seconds, boosted every 1.67 seconds. Pause stops simulation increments and animation. Reduced motion removes the wheel, paw, hamster, and seed animations while preserving all controls and values.
- **Work panel:** `.work-panel`, `.segmented-progress`, `.progress-reading`, and `.next-stop`. The segmented bar is a named progressbar with current/minimum/maximum values. A seed adds six turns, activates eight seconds of boost, and resumes a paused simulation. Each 100 turns completes a local batch. The static sparkline is explicitly labeled illustrative history.
- **Ecosystem cards:** `StatusCard` in `src/main.tsx` is a local component pattern with `icon`, `title`, `value`, `text`, and `badge` props. All cards share the same information order; the group is labeled demo status.
- **Journey:** `.journey-steps` is an ordered list. The highlighted step follows the simulation phase; explanatory text states that no transaction is sent.
- **Activity feed:** `ActivityFeed` in `src/main.tsx`, with parsing and sample rows in `src/activity.ts`. Filters are native buttons with `aria-pressed`. Fetches have a 6.5-second timeout and cancel on unmount. Loading, sample fallback, empty, retry, and live snapshot states are implemented. Fetch/status announcements change on meaningful events rather than every clock tick.
- **Dialogs:** Native `<dialog>` for transaction details and sharing. Escape, close buttons, and backdrop clicks close them. Native focus handling returns to the opener. Full transaction IDs and addresses remain selectable. Only real API hashes have explorer links. Sharing offers an X intent and clipboard copy with a selectable-link fallback.

Interactive transitions last 120ms and name their properties; pressed buttons scale to .96 only when motion is allowed. Infinite animation is defined only inside `prefers-reduced-motion: no-preference`.

## Do’s and Don’ts

- Start another page with `.page-shell`, the shared header/footer, one h1, and the existing `.surface` pattern. Register a hash route rather than requiring server rewrites.
- Reuse semantic color tokens, six type sizes, and the existing button patterns. Keep pixel type for short accents and numbers.
- Keep “Local simulation,” “Sample data,” and live network data distinct. Never connect seed interactions to an implied onchain result.
- Put a new control immediately beside the information it changes. Provide a useful loading, failure, and empty state when applicable.
- Keep full data accessible in details; avoid clipping critical IDs. Preserve keyboard focus and reduced-motion behavior.
- Edit `artwork/share-card.html` and run `npm run render:share` to regenerate the local social image, then rebuild the export.

Design guidance was adapted from Jakub Krehel’s Better Interface (MIT). The documentation method was adapted from Paul Bakaus’s Impeccable (Apache-2.0). Exact pinned upstream attribution and full notices are retained in `artifacts/DESIGN-GUIDANCE-LICENSE.txt` and the validation document.
