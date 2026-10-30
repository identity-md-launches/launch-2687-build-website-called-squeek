# Squeek Radar

A playful, responsive Squeekchain dashboard: a pixel hamster wheel, interactive local work simulation, SQK ecosystem cards, an educational settlement timeline, and recent Ethereum Sepolia activity. The About page explains the hamster-powered toychain. Sharing includes an X intent, clipboard link, favicon, and a locally bundled 1200 × 630 social card.

No wallet, token, contract deployment, backend, or private credential is required.

## Install, develop, and rebuild

Use Node.js 22.12+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Generate the production export and preview it:

```sh
npm run typecheck
npm run build
npm run check:export
npm run preview
```

`dist/index.html` and all required assets are already included. A static server can serve `dist/` directly. Vite uses `base: './'`; bundled scripts, CSS, fonts, favicon, and social image resolve under a hosting subpath. Dashboard and About use hash routing (`#/` and `#/about`) and need no server rewrites. Rebuilding replaces `dist/`; retain the resulting export with the source and lockfile.

## What is live?

The wheel is a browser-local toy. Give a seed to add six turns and boost Squeek from 12 to 36 simulated rpm for eight seconds. Pause/resume controls the simulation. A batch completes every 100 turns; wheel stats reset on reload. The chart is labeled illustrative history. This interaction never sends a transaction.

The activity feed independently requests the latest network-wide validated Sepolia transactions from the public [Blockscout explorer](https://eth-sepolia.blockscout.com). It loads up to 20 rows per snapshot; Refresh retrieves another snapshot. Filters select transfers or contract calls; transaction rows open details with full IDs and explorer links. Network/API failure, invalid response shape, or a 6.5-second timeout produces visibly labeled sample rows with descriptive sample IDs and no fabricated explorer links.

The public endpoint is set in `src/activity.ts`. Availability and CORS support may change; the static dashboard and its sample fallback remain usable. No Squeekchain contract address was supplied, so real feed rows are explicitly network-wide rather than attributed to Squeekchain. The site’s [About page](dist/index.html#/about) explains this distinction.

## Checks

For reproducible interaction checks, install browser binaries and run:

```sh
npx playwright install chromium webkit
npm run test:interactions
```

Native browser runtime dependencies may also be needed on Linux. `npm run test:interactions -- --chromium-only` runs just Chromium. The script serves the actual production export under `/preview/`, intercepts only the transaction API with deterministic fixtures, checks interactions and resource failures, and closes its own server/browser. The fixture contains a trimmed public Sepolia response, independent of the illustrative UI sample data.

To edit the social card:

```sh
npm run render:share
npm run build
```

The editable composition is `artwork/share-card.html`. All runtime images and fonts are local. No CDN is needed to render the interface. A production X crawler/unfurl was not tested because no public origin is assigned in this delivery; `og:image` is relative for static hosting, and can be normalized by the publisher once the public URL is known.

### Recorded results

- Production build: passed; complete static export is 367,605 bytes (about 359 KiB).
- TypeScript `tsc --noEmit`: passed.
- Interaction validation: 12 Chromium scenarios passed, covering seed/boost, progress, batch completion, pause/resume, filters, pagination, dialogs, navigation, sharing, loading, timeout, failure, empty response, malformed data, and recovery.
- Responsive checks: no horizontal overflow at 320, 390, 768, 1024, or 1440px. The product and main action are visible on the first 390 × 844 screen.
- Pinned `taste@1` review: 16/16 checks passed after corrections; reduced motion stops all four detected endless animations; no script errors or missing local files.
- Read-only live API: successfully loaded real Sepolia rows in the browser. Fixtures and failure states were also exercised.
- WebKit: launch was attempted, but native runtime dependencies were unavailable. Safari interactions are unverified. No physical-device or screen-reader test is claimed.

Dependencies for this build were installed in a temporary external prefix to leave repository dependency directories untouched. The production build imported `vite.config.ts` through a scratch wrapper that only resolved React to that prefix; typechecking used an equivalent scratch configuration for external type declarations. Exact commands, findings, six-domain review, evidence, and limitations are in [artifacts/validation.md](artifacts/validation.md).

## Design and source

See [DESIGN.md](DESIGN.md) for the implemented colors, typography, component patterns, motion, and responsive behavior. `src/main.tsx` holds pages and interactions; `src/activity.ts` owns transaction parsing and samples; `src/Hamster.tsx` and `src/icons.tsx` contain original SVG artwork.

DM Sans and Silkscreen are locally bundled under their SIL Open Font Licenses, included in `public/fonts/`. The Better Interface and Impeccable guidance attribution and full notices are retained in `artifacts/DESIGN-GUIDANCE-LICENSE.txt`.
