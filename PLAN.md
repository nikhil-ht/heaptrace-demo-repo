# Feature Plan: KAN-2 — Add Sticky Footer with Application Details

## Overview

- **Requirement**: Add a sticky footer that remains visible at the bottom of the viewport across all pages and displays application details/links without overlapping page content.
- **Requested by**: Work item KAN-2
- **Priority**: Medium
- **Estimated total effort**: M (1–3 hours)
- **Affected areas**:
  - `app/src/App.tsx` (global shell/layout)
  - `app/src/theme.ts` (optional theme token usage only if needed)
  - `app/src/pages/*` (validation only; no direct footer rendering)

## User Stories

- As a clinician user, I want app metadata in a persistent footer so I can always identify the application/version.
- As a user on mobile/tablet/desktop, I want the footer to remain accessible and readable at all viewport sizes.
- As a user navigating long dashboard content, I want the footer to stay visible without hiding important page content.
- As a compliance stakeholder, I want privacy/terms/help links consistently accessible from all screens.

## UI Mockups

### Desktop — Loaded State

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ AppBar: Hypertension Dashboard                                   FHIR demo  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Main content (patient list/dashboard widgets)                                │
│ ...                                                                          │
│ ... (scrollable content)                                                     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hypertension Dashboard • v1.0.0         © 2026 Heaptrace Demo               │
│ Privacy Policy   Terms of Service   Help/Support                             │
└──────────────────────────────────────────────────────────────────────────────┘
(footer fixed to viewport bottom; main content has bottom spacing/padding)
```

### Mobile — Loaded State

```text
┌──────────────────────────────┐
│ AppBar                        │
├──────────────────────────────┤
│ Main content                 │
│ ...                          │
│ ...                          │
├──────────────────────────────┤
│ Hypertension Dashboard       │
│ v1.0.0 • © 2026              │
│ Privacy • Terms • Help       │
└──────────────────────────────┘
(links wrap to next line, centered/aligned for readability)
```

### Empty/Loading/Error States

```text
Footer behavior is identical in all page states:
- Loading (spinners/skeletons): footer remains visible at bottom
- Empty pages: footer still anchored to bottom of viewport
- Error states: footer still visible and non-overlapping
```

## Data Flow

```text
┌────────────────────┐
│ App shell (App.tsx)│
└─────────┬──────────┘
          │
          ├─ renders AppBar
          ├─ renders Route content container
          └─ renders StickyFooter component/section (new)
                   │
                   ├─ static app name (constant)
                   ├─ static/cfg version string
                   ├─ static copyright text
                   └─ link list (privacy/terms/help)

No backend/API/FHIR data dependencies.
```

## API Contracts

- No API changes.
- No new endpoints.
- No request/response shape changes.

## Data/Fixture Changes

- No server fixture changes.
- No FHIR bundle changes.
- Optional only: version display source can be hardcoded initially, or read from existing app metadata if already exposed in build-time env.

## Task Breakdown

### Task 1: Define global sticky-footer layout contract

- **Type**: Frontend
- **Description**: Update app shell layout to reserve space for a fixed footer and prevent content overlap using flex/min-height plus bottom padding strategy.
- **Depends on**: None
- **Files likely involved**: `app/src/App.tsx`
- **Estimated effort**: S

### Task 2: Implement footer UI content and responsive behavior

- **Type**: Frontend
- **Description**: Add footer section/component in app shell with app name, version, copyright, and links; apply responsive typography/wrapping using MUI primitives.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/App.tsx` (and optionally a new small component under `app/src/components/` if needed)
- **Estimated effort**: S

### Task 3: Align styling with design system

- **Type**: Frontend/Design
- **Description**: Use existing palette/typography/spacing tokens so footer visually matches AppBar/theme; verify contrast and hover/focus states on links.
- **Depends on**: Task 2
- **Files likely involved**: `app/src/App.tsx`, optionally `app/src/theme.ts` if token reuse is needed
- **Estimated effort**: S

### Task 4: Validate behavior across routes and viewport sizes

- **Type**: Verification
- **Description**: Manually validate footer on `/` and `/patients/:id`, including long-scroll dashboard scenarios and mobile/tablet breakpoints.
- **Depends on**: Task 3
- **Files likely involved**: No source changes expected
- **Estimated effort**: S

### Task 5: Build verification and PR evidence

- **Type**: Verification/Docs
- **Description**: Run required app build check, collect screenshots for UI change, and finalize PR notes.
- **Depends on**: Task 4
- **Files likely involved**: PR metadata only
- **Estimated effort**: S

## Dependency Map

```text
Task 1 → Task 2 → Task 3 → Task 4 → Task 5

Parallelization note:
- Tasks 4 and 5 remain sequential due to validation dependencies.
```

## Risks & Edge Cases

### Risk Assessment

| Risk Area | Risk | Mitigation |
|---|---|---|
| Layout overlap | Fixed footer can cover bottom rows/cards | Reserve footer height via container bottom padding and validate on dense dashboard route |
| Responsiveness | Link row may overflow on narrow devices | Use wrapping Stack/Flex + smaller typography at `xs` breakpoints |
| Accessibility | Link contrast/focus may be weak | Use theme text colors and visible focus styles |
| Consistency | Footer style may drift from design system | Reuse MUI theme palette/spacing/typography tokens |
| Future versioning | Hardcoded version can become stale | Prefer build-time env/package version source if already available |

### Edge Cases Checklist

- [ ] Very short pages (footer should still sit at viewport bottom)
- [ ] Very long dashboard pages with scroll (footer remains fixed and content remains readable)
- [ ] Mobile width where links need wrapping
- [ ] Route transitions between patient list and patient dashboard
- [ ] Keyboard navigation to footer links (focus visible)
- [ ] External links opening safely (`rel`/`target` policy decision)

## Out of Scope

- Backend/FHIR API changes.
- New legal-content pages implementation (if links are placeholders, route/page creation is separate scope unless explicitly requested).
- Internationalization/localization of footer text.
- Dynamic remote configuration service for footer metadata.

## Test Plan

### Existing project validation (required)

1. Run `npm --workspace app run build`.
2. Run app locally (`npm run dev`) and verify:
   - `/` footer fixed at bottom, non-overlapping.
   - `/patients/patient-persimmon` footer fixed during long-scroll content.
   - Responsive behavior at desktop/tablet/mobile widths.
3. Capture UI screenshot(s) showing footer integration.

### Automated tests

- Current repository has no formal test suite for this UI surface; no new test harness is introduced in this ticket.
- If lightweight tests already exist later, add focused coverage for footer rendering and content presence.

## Open Questions

1. Should the version be sourced from `package.json` at build time or a static string in UI for now?
2. Should Privacy/Terms/Help links point to real internal routes, external URLs, or remain placeholders until legal pages exist?
3. Exact copyright owner text expected (e.g., product org legal entity name).
4. Should footer links open in the same tab or new tab?
