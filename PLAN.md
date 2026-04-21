# Feature Plan: KAN-2 — Add Sticky Footer with Application Details

## Overview
- **Requirement**: Add a sticky footer that remains visible at the bottom of the viewport across all pages, shows application metadata/links, and does not overlap content.
- **Requested by**: Product/Issue Tracker
- **Priority**: Medium
- **Issue link**: https://heaptrace-demo.atlassian.net/browse/KAN-2
- **Estimated total effort**: M (1–3 hours)
- **Affected areas**: `app/src/App.tsx`, `app/src/theme.ts` (if theme tokens are needed), optional new footer component under `app/src/components/`

## User Stories
- As a clinician user, I want to always see core app metadata (name/version/copyright) so that I can confirm the app context.
- As a user on desktop/tablet/mobile, I want footer content to be readable and well-spaced on my device.
- As a user navigating long pages, I want the footer visible without obscuring page content.
- As a user, I want quick access to policy/help links from any page.

## UI Mockups

### Desktop — default
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ App Bar: Hypertension Dashboard                                    FHIR demo │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Page Content (routes)                                                       │
│  ...scrollable...                                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hypertension Dashboard • v0.1.0 • © 2026 Heaptrace Demo   Privacy Terms Help│  <- fixed bottom
└──────────────────────────────────────────────────────────────────────────────┘
```

### Mobile — wrapped footer layout
```
┌──────────────────────────────────────────────┐
│ App Bar                                     │
├──────────────────────────────────────────────┤
│ Content                                     │
│                                              │
├──────────────────────────────────────────────┤
│ Hypertension Dashboard • v0.1.0             │
│ © 2026 Heaptrace Demo                       │
│ Privacy • Terms • Help                      │  <- fixed bottom, 2-3 rows
└──────────────────────────────────────────────┘
```

### Loading/empty/error page states
```
Any route state (loading/empty/error) renders above the same fixed footer shell.
Footer content remains visible and unchanged.
```

## Data Flow
```
┌───────────────────────────────────────────────────────────────┐
│ Build-time metadata                                           │
│  - package.json version                                       │
│  - static app copy (name/copyright/links)                     │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│ App shell (`App.tsx`)                                          │
│  - Renders top AppBar                                           │
│  - Renders main route container                                 │
│  - Renders fixed footer component                               │
│  - Applies bottom padding/margin on main content to avoid overlap│
└───────────────────────────────────────────────────────────────┘
```

## API Contracts
- **No API changes required.**
- Existing frontend-only layout change; no new backend endpoints, request params, or response schema updates.

## Data/Fixture Changes
- **No fixture/data changes required.**
- `server/` fixture bundles and generators remain unchanged.

## Task Breakdown

### Task 1: Define footer structure and responsive layout
- **Type**: Frontend
- **Description**: Introduce a reusable footer section with app name, version, copyright, and link set.
- **Depends on**: None
- **Files likely involved**: `app/src/App.tsx` or `app/src/components/AppFooter.tsx`
- **Estimated effort**: S

### Task 2: Make footer fixed and prevent content overlap
- **Type**: Frontend
- **Description**: Update app shell layout so footer is fixed to viewport bottom; add bottom spacing in content container equal to footer height (responsive).
- **Depends on**: Task 1
- **Files likely involved**: `app/src/App.tsx`
- **Estimated effort**: S

### Task 3: Apply design-system aligned styling
- **Type**: Frontend
- **Description**: Use MUI theme palette/typography/dividers/spacing for consistent style and visual hierarchy.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/App.tsx`, `app/src/theme.ts` (only if extra tokens are needed)
- **Estimated effort**: S

### Task 4: Validate responsiveness and accessibility
- **Type**: Frontend
- **Description**: Ensure links are keyboard accessible, have visible focus states, and layout wraps correctly on mobile/tablet/desktop widths.
- **Depends on**: Tasks 1–3
- **Files likely involved**: `app/src/App.tsx` (+ optional footer component)
- **Estimated effort**: S

### Task 5: Verify and capture visual evidence
- **Type**: Validation
- **Description**: Run required build check and manual UI verification; capture screenshots demonstrating footer behavior.
- **Depends on**: Tasks 1–4
- **Files likely involved**: none (validation artifacts not committed)
- **Estimated effort**: S

## Dependency Map
- Task 1 starts first.
- Tasks 2 and 3 depend on Task 1 and can proceed in parallel.
- Task 4 depends on Tasks 1–3.
- Task 5 depends on Task 4 completion.

Critical path: **1 → 2/3 → 4 → 5**

## Risks & Edge Cases

### Risks
| Risk Area | Risk | Mitigation |
|---|---|---|
| Layout overlap | Fixed footer can hide bottom content or last table row | Reserve bottom space on route container with responsive padding matching footer height |
| Small screens | Long metadata/link text may overflow | Use wrapping + stacked layout at smaller breakpoints; avoid fixed single-row assumptions |
| Theme consistency | Footer may look visually detached from MUI design language | Use theme tokens (`palette`, `typography`, `divider`, `spacing`) only |
| External links | Navigation target behavior may be inconsistent | Use explicit link strategy (`target`/`rel`) if external; keep routing/local links explicit |
| Version drift | Hardcoded version can become stale | Source version from package metadata constant or centralized config |

### Edge Cases Checklist
- [ ] Very short pages still keep footer pinned to viewport bottom.
- [ ] Very long pages can scroll while footer remains visible.
- [ ] Last content element remains fully visible above footer at all breakpoints.
- [ ] Links wrap without clipping on narrow devices.
- [ ] Missing/undefined version fallback does not break render.

## Out of Scope
- Backend/FHIR API changes.
- New CMS/config service for legal/help URLs.
- Localization/i18n for footer text.
- Analytics/telemetry for footer link clicks.

## Test Plan
- Manual verification in app shell on:
  - Desktop width (≥1200px)
  - Tablet width (~768px)
  - Mobile width (~375px)
- Route coverage:
  - `/`
  - `/patients/:id`
- Behavior checks:
  - Footer stays fixed at bottom during scroll.
  - Footer content (name, version, copyright, links) is present.
  - No content hidden behind footer.
  - Links are keyboard-focusable and clickable.
- Required repo check before final implementation handoff:
  - `npm --workspace app run build`

## Open Questions
- Confirm final legal copy owner text (e.g., “Heaptrace Demo” vs organization legal name).
- Confirm whether Privacy/Terms/Help are external URLs, internal routes, or placeholders for now.
- Confirm preferred year formatting (`© 2026` fixed vs dynamic current year).
- Confirm whether footer should include environment badge (dev/staging/prod) in future scope.
