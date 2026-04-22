# Feature Plan: KAN-1 — Sticky Footer with Application Details

## Overview

- **Requirement**: Add a sticky footer that remains visible at the bottom of the viewport on all pages and displays application metadata/links.
- **Requested by**: Jira work item KAN-1 (`https://heaptrace-demo.atlassian.net/browse/KAN-1`)
- **Priority**: Medium
- **Estimated total effort**: M (1–3 hours)
- **Affected areas**: `app/src/App.tsx`, new footer component in `app/src/components/`, optional theme spacing tweaks in `app/src/theme.ts`

## User Stories

- As a clinician, I want persistent app metadata visible from any page, so I always know the application context/version.
- As a user, I want quick access to Privacy Policy, Terms of Service, and Help links from anywhere in the app.
- As a mobile user, I want footer content to remain readable and non-overlapping, so the experience remains usable on small screens.

## UI Mockups

### Desktop / Tablet (default)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ App Bar                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Main content container                                                       │
│ (patient list or patient dashboard)                                          │
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hypertension Dashboard • v0.1.0   © 2026 Heaptrace Demo    Privacy | Terms | Help │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (stacked footer)

```text
┌──────────────────────────────┐
│ App Bar                      │
├──────────────────────────────┤
│ Main content                 │
│                              │
├──────────────────────────────┤
│ Hypertension Dashboard       │
│ v0.1.0 • © 2026              │
│ Privacy  Terms  Help         │
└──────────────────────────────┘
```

### Loading / Empty / Error states

```text
All existing page states remain unchanged.
Footer remains visible and identical in all states.
```

## Data Flow

```text
┌─────────────────────┐
│ app/package.json    │
│ version: "0.1.0"    │
└──────────┬──────────┘
           │ (imported/build-time constant)
           ▼
┌─────────────────────┐
│ App layout shell    │
│ (global wrapper)    │
└──────────┬──────────┘
           │ props/static constants
           ▼
┌─────────────────────────────────────────────────────┐
│ StickyFooter component                              │
│ - app name                                          │
│ - version                                           │
│ - copyright text                                    │
│ - links (Privacy / Terms / Help)                   │
└─────────────────────────────────────────────────────┘
```

## API Contracts

- No new backend endpoints.
- No changes to FHIR requests/responses.

## Database Changes

- None.

## Data/Fixture Changes

- None.

## Task Breakdown

### Task 1: Add reusable sticky footer component

- **Type**: Frontend
- **Description**: Create a presentational footer component using MUI primitives with app details and link slots.
- **Depends on**: None
- **Files likely involved**: `app/src/components/AppFooter.tsx`
- **Estimated effort**: S

### Task 2: Integrate footer into global app layout

- **Type**: Frontend
- **Description**: Update app shell to use a column layout with `minHeight: 100vh`, non-shrinking footer, and main content flex behavior to keep footer pinned while preventing overlap.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/App.tsx`
- **Estimated effort**: S

### Task 3: Add responsive footer behavior and spacing safeguards

- **Type**: Frontend
- **Description**: Ensure typography/link layout adapts for mobile (stack/wrap), and ensure page content remains visible without hidden bottom rows.
- **Depends on**: Task 2
- **Files likely involved**: `app/src/components/AppFooter.tsx`, `app/src/App.tsx`
- **Estimated effort**: S

### Task 4: Validate build and manual UI behavior

- **Type**: Frontend / Verification
- **Description**: Run app build and manually verify both `/` and `/patients/:id` across viewport sizes; capture screenshot evidence.
- **Depends on**: Task 3
- **Files likely involved**: no source changes expected
- **Estimated effort**: S

## Dependency Map

- Task 1 → Task 2 → Task 3 → Task 4
- No parallel branches required; work is linear and low risk.

## Risks & Edge Cases

### Risk Table

| Risk Area | Risk | Mitigation |
| --- | --- | --- |
| Layout overlap | Footer could cover bottom content if positioned fixed without content offset | Use flex column shell and natural document flow (`mt: auto`) instead of hard fixed overlay |
| Responsiveness | Footer text and links may overflow on narrow screens | Use responsive `Stack`/`Box` with wrapping and smaller typography |
| Styling drift | Footer may look inconsistent with MUI theme | Use theme palette/typography and container width conventions |
| Link behavior | Placeholder links might break navigation expectations | Use safe routes/placeholders and explicitly mark as app-level utility links |

### Edge Cases Checklist

- [ ] Very small mobile width (320px) still shows all footer items without clipping.
- [ ] Long page content still scrolls fully and footer remains at page bottom.
- [ ] Short page content keeps footer at viewport bottom.
- [ ] Dashboard grid bottom widgets remain fully visible.
- [ ] Footer remains visible in loading/empty/error page states.

## Out of Scope

- Implementing full Privacy/Terms/Help pages (only links/targets are included).
- Backend/config-driven runtime metadata endpoint for footer content.
- Internationalization/localization of footer text.

## Test Plan

- Build: `npm --workspace app run build`
- Manual verification with `npm run dev`:
  - `/` patient list page
  - `/patients/patient-persimmon`
  - `/patients/patient-001`
  - Desktop, tablet, and mobile viewport checks
- Visual confirmation: capture at least one screenshot showing sticky footer on UI.

## Open Questions

- Should Privacy/Terms/Help link to internal routes, external URLs, or placeholders for now?
- Should copyright year be static (e.g., 2026) or derived dynamically?
- Should the version be sourced from `package.json` at build time or from a runtime env variable?
