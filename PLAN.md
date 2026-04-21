# Feature Plan: KAN-2 — Sticky Footer with Application Details

## Overview

- **Requirement**: Add a responsive sticky footer fixed to the viewport bottom across all pages, showing application metadata and utility links, without hiding page content.
- **Requested by**: Jira work item comment (`@unknown`) for KAN-2
- **Priority**: Medium
- **Estimated total effort**: 6-10 hours
- **Affected areas**: `app/src/App.tsx`, new shared footer component under `app/src/components/`, theme-aware styling usage, optional constants/config for metadata text
- **Issue link**: https://heaptrace-demo.atlassian.net/browse/KAN-2
- **Branch/PR naming requirement**: branch name and PR title must include `KAN-2`

## User Stories

- As a clinician using the dashboard, I want app details always visible at the bottom so I can quickly confirm product/version context.
- As a user on mobile/tablet/desktop, I want footer links to remain accessible and readable at all screen sizes.
- As a user scrolling long pages, I want the footer to stay visible while ensuring main content is never obscured.

## UI Mockups

### Desktop — default

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ AppBar: Hypertension Dashboard                                FHIR demo      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Main page content (patient list or dashboard widgets)                       │
│  ...                                                                         │
│  ...                                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hypertension Dashboard • v0.1.0   © 2026 Heaptrace   Privacy | Terms | Help │  <- fixed
└──────────────────────────────────────────────────────────────────────────────┘
```

### Mobile — stacked footer content

```text
┌──────────────────────────────────────────────┐
│ AppBar                                       │
├──────────────────────────────────────────────┤
│                                              │
│ Main content                                 │
│                                              │
├──────────────────────────────────────────────┤
│ Hypertension Dashboard • v0.1.0              │
│ © 2026 Heaptrace                             │
│ Privacy  Terms  Help                         │  <- fixed, wraps safely
└──────────────────────────────────────────────┘
```

### Loading/empty/error page states

```text
All existing states continue rendering inside main content container.
Footer remains fixed and unchanged across state transitions.
```

## Data Flow

```text
┌────────────────────┐
│ app/package.json   │  (version)
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐      route changes       ┌────────────────────────┐
│ App shell (App.tsx)├─────────────────────────▶│ Main content (Routes)  │
└─────────┬──────────┘                          └────────────────────────┘
          │
          │ renders footer props/static config
          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ StickyFooter component (fixed bottom, responsive layout, links, copyright)│
└────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
     Viewport bottom
```

## API Contracts

No backend or HTTP API changes are required.

Internal UI contract:

- `StickyFooter` props (if componentized):
  - `appName: string`
  - `version: string`
  - `copyright: string`
  - `links: Array<{ label: string; href: string; external?: boolean }>`
- Behavior contract:
  - Footer uses fixed positioning at viewport bottom.
  - App shell reserves bottom spacing/padding equal to footer height to prevent overlap.
  - Links are keyboard-focusable and visible in high-contrast theme usage.

## Data/Fixture Changes

None. No FHIR fixture updates needed.

## Task Breakdown

### Task 1: Confirm footer content source and link targets

- **Type**: Frontend / Product alignment
- **Description**: Finalize exact text for app name, copyright owner/year strategy, and destination URLs (or placeholders) for Privacy, Terms, Help.
- **Depends on**: None
- **Files likely involved**: `PLAN.md` (scope confirmation), optionally a new constants file in app
- **Estimated effort**: S (30-60 min)

### Task 2: Introduce reusable StickyFooter component

- **Type**: Frontend
- **Description**: Create a dedicated footer component using MUI primitives, responsive layout behavior, and accessible links.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/components/StickyFooter.tsx` (new)
- **Estimated effort**: M (1-2 hr)

### Task 3: Integrate footer into global app shell

- **Type**: Frontend
- **Description**: Update `App.tsx` structure to ensure footer is always visible and page content area includes safe bottom spacing so content is never hidden.
- **Depends on**: Task 2
- **Files likely involved**: `app/src/App.tsx`
- **Estimated effort**: M (1-2 hr)

### Task 4: Responsive and visual alignment polish

- **Type**: Frontend / Design consistency
- **Description**: Apply theme-consistent colors/typography and verify breakpoints for desktop/tablet/mobile wrapping and spacing.
- **Depends on**: Task 3
- **Files likely involved**: `app/src/components/StickyFooter.tsx`, `app/src/theme.ts` (only if token additions are needed)
- **Estimated effort**: M (1-2 hr)

### Task 5: Validation and manual QA evidence

- **Type**: Verification
- **Description**: Build app, run manual checks on `/` and `/patients/:id`, validate non-overlap behavior during scroll, capture screenshots for PR.
- **Depends on**: Tasks 3, 4
- **Files likely involved**: no source changes expected (unless small spacing fix found)
- **Estimated effort**: M (1-2 hr)

## Dependency Map

```text
Task 1 → Task 2 → Task 3 → Task 4 → Task 5
```

Parallelization notes:
- No major parallel tracks; this is an app-shell change with direct sequencing.
- Minor documentation prep (PR checklist/screenshot template) can run in parallel with Task 4.

## Risks & Edge Cases

### Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Unknown final link URLs | Rework if placeholders become invalid | Confirm canonical URLs in Task 1; allow config-driven link list |
| Footer overlaps content on short viewports | Hidden controls/data at bottom of pages | Reserve content bottom padding/min-height based on footer height |
| Footer wraps poorly on small devices | Usability/readability degradation | Use responsive Stack/Flex with breakpoint-aware wrap and spacing |
| Inconsistent visual style vs app design system | UI mismatch | Use existing MUI theme tokens and typography variants |
| Accessibility issues for links | Keyboard/screen-reader usability gap | Semantic `<footer>`, visible focus states, meaningful link labels |

### Edge Cases Checklist

- [ ] Very short viewport heights (landscape mobile) still show footer without clipping content.
- [ ] Long main content scroll does not cause footer to overlap bottom cards/buttons.
- [ ] Footer link row wraps gracefully when translated/longer labels are used.
- [ ] Missing/empty link URL handling (render disabled text or omit link safely).
- [ ] App version source unavailable at runtime (fallback to static default string).
- [ ] High zoom (200%) preserves readability and clickable targets.

## Out of Scope

- Backend API or FHIR route changes.
- Authentication/authorization changes for footer links.
- New CMS/settings page for runtime editing of footer metadata.
- Localization/i18n implementation (future enhancement only).

## Test Plan

- [ ] Run `npm --workspace app run build` to verify TypeScript + production build pass.
- [ ] Manual UI check on desktop width for both routes: `/` and `/patients/patient-persimmon`.
- [ ] Manual UI check on tablet and mobile responsive breakpoints.
- [ ] Confirm footer remains visible while scrolling both short and long pages.
- [ ] Confirm no widget/table content is hidden beneath footer.
- [ ] Verify footer links are keyboard navigable and render correct targets.
- [ ] Capture screenshots showing sticky behavior and responsive layout for PR evidence.

## Open Questions

1. Confirm official copyright owner text (e.g., “© 2026 Heaptrace” vs product owner legal name).
2. Confirm whether Privacy/Terms/Help URLs should open internal routes or external pages.
3. Should version be sourced from `app/package.json` at build time or be a hardcoded display value initially?
4. Should footer be globally fixed in all future routes (including potential full-screen views), or allow per-route opt-out?
