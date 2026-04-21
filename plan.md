# Feature Plan: KAN-4 — Add Support for Dark and Light Theme

## Overview

- **Requirement**: Add Dark and Light theme support to improve UI consistency, readability, and standardized graph appearance.
- **Requested by**: Work item comment (`@unknown`) for ticket KAN-4.
- **Priority**: High
- **Estimated total effort**: L (4–6 hours)
- **Affected areas**:
  - `app/src/theme.ts`
  - `app/src/main.tsx`
  - `app/src/App.tsx`
  - `app/src/components/widgets/BPTrendChart.tsx`
  - `app/src/components/widgets/LabTrendChart.tsx`
  - `app/src/components/widgets/EncountersTimeline.tsx`
  - `app/src/components/ChartRangeSelector.tsx`
  - `app/src/pages/PatientListPage.tsx`

## User Stories

- As a clinician, I want to switch between Light and Dark themes so I can use the dashboard comfortably in different lighting conditions.
- As a clinician, I want charts and widgets to remain visually consistent and readable in either theme so trend interpretation is reliable.
- As a product team member, I want theme behavior standardized across pages so UI quality is predictable and maintainable.

## UI Mockups

### 1) App shell — Light mode (default)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [♥] Hypertension Dashboard                                   FHIR demo  [☀] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hypertension Patients                                                        │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ DataGrid rows...                                                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2) App shell — Dark mode

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [♥] Hypertension Dashboard                                   FHIR demo  [🌙] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hypertension Patients                                                        │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ DataGrid rows... (dark surfaces, readable text, preserved contrast)    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3) Dashboard chart card (both themes)

```text
┌ Blood Pressure Trend                                      [3m|6m|1y|All] ┐
│                                                                          │
│  Y-axis labels and grid visible in current theme                         │
│  SBP line: theme-safe contrast color                                     │
│  DBP line: theme-safe contrast color                                     │
│  Target lines/bands legible on both light and dark backgrounds           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4) Loading / Empty / Error states

```text
Loading: [spinner/skeleton colors inherit theme tokens]
Empty:   "No encounters to plot" (text.secondary in both themes)
Error:   "Failed to load patients" (error.main with compliant contrast)
```

## Data Flow

```text
User clicks theme toggle in AppBar
        │
        ▼
React state (theme mode: "light" | "dark")
        │
        ▼
MUI createTheme(mode-specific palette + component overrides)
        │
        ▼
<ThemeProvider theme={...}> re-renders app
        │
        ├── App shell surfaces and typography update
        ├── MUI components (DataGrid, Paper, Card, Chip, ToggleButton) update
        └── Chart widgets consume theme-derived colors (axes/grid/lines/bands)
```

## API Contracts

No backend/API changes required.

## Data/Fixture Changes

No fixture or server data changes required.

## Database Changes

No database changes required.

## Task Breakdown

### Task 1: Define dual-theme tokens and mode-aware theme factory

- **Type**: Frontend
- **Description**: Refactor static light-only theme into a mode-aware theme factory with explicit palette tokens for light and dark, including background/surface/text states.
- **Depends on**: None
- **Files likely involved**:
  - `app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Add theme mode state and toggle control in app shell

- **Type**: Frontend
- **Description**: Add mode state in root app composition, wire `ThemeProvider` to mode-aware theme, and add an accessible AppBar toggle (icon/button) for Light/Dark switching.
- **Depends on**: Task 1
- **Files likely involved**:
  - `app/src/main.tsx`
  - `app/src/App.tsx`
- **Estimated effort**: M

### Task 3: Standardize widget and chart styling against theme tokens

- **Type**: Frontend
- **Description**: Replace hardcoded chart/legend/grid/reference colors and timeline class styling where needed with theme-safe values so readability and consistency are preserved in both modes.
- **Depends on**: Task 1
- **Files likely involved**:
  - `app/src/components/widgets/BPTrendChart.tsx`
  - `app/src/components/widgets/LabTrendChart.tsx`
  - `app/src/components/widgets/EncountersTimeline.tsx`
  - `app/src/components/ChartRangeSelector.tsx`
  - `app/src/components/widgets/WidgetCard.tsx` (if minor token alignment needed)
- **Estimated effort**: L

### Task 4: Validate DataGrid and page-level contrast consistency

- **Type**: Frontend
- **Description**: Ensure Patient List/DataGrid and dashboard containers maintain accessible contrast and visual consistency across themes.
- **Depends on**: Task 1, Task 2
- **Files likely involved**:
  - `app/src/pages/PatientListPage.tsx`
  - `app/src/App.tsx`
  - `app/src/theme.ts` (component overrides, if needed)
- **Estimated effort**: M

### Task 5: Manual verification and PR readiness metadata

- **Type**: Config/Validation
- **Description**: Verify Light/Dark rendering in key flows, build app, capture screenshots, and ensure PR metadata includes KAN-4 identifier and original issue link.
- **Depends on**: Task 2, Task 3, Task 4
- **Files likely involved**:
  - PR title/body metadata only
- **Estimated effort**: S

## Dependency Map

- **Critical path**: Task 1 → Task 2 → (Task 3 + Task 4 in parallel) → Task 5
- **Parallelizable work**:
  - Task 3 and Task 4 can proceed concurrently after Tasks 1 and 2 baseline is in place.

## Risks & Edge Cases

### Risk Table

| Risk Area | Risk | Mitigation |
| --- | --- | --- |
| Visual contrast | Dark mode text/lines may become low-contrast | Use theme tokens with explicit contrast checks for chart lines, axis labels, and chips |
| Chart consistency | Recharts defaults may ignore MUI palette intent | Pass explicit theme-derived colors for grid, tooltip text, lines, and reference elements |
| Component drift | Mixed hardcoded hex values across widgets cause inconsistent appearance | Centralize chart/UI color mapping from theme and apply uniformly |
| Accessibility | Toggle may be icon-only and ambiguous for screen readers | Add ARIA label/title and clear selected state |
| Regression | Existing light-mode look may unintentionally change | Keep light palette values aligned with current baseline and manually compare key screens |

### Edge Cases Checklist

- [ ] Theme toggle state when user navigates between Patient List and Dashboard
- [ ] Charts with sparse data still readable in dark mode (labels, dots, bands)
- [ ] Empty states (`No encounters to plot`) contrast remains adequate in both modes
- [ ] Error states (failed data load) remain clear and accessible
- [ ] DataGrid row hover/selection remains visible in dark mode

## Out of Scope

- Persisting theme preference to local storage or user profile
- Introducing additional themes beyond Light and Dark
- Backend, FHIR route, or fixture model changes
- Reworking dashboard layout or widget data logic unrelated to theme support

## Test Plan

- Manual verification (required in this repository’s current state):
  1. Run app locally and verify Light mode default renders existing pages correctly.
  2. Toggle to Dark mode on `/` and `/patients/patient-persimmon`.
  3. Validate readability of BP/Lab charts (axes, lines, reference marks, tooltips).
  4. Validate `EncountersTimeline` chips/bars/text contrast in both modes.
  5. Validate `PatientListPage` DataGrid contrast and interactions in both modes.
  6. Run `npm --workspace app run build` before final implementation PR submission.

## Open Questions

1. Should theme preference persist across reloads (localStorage), or reset to Light each session?
2. Should system preference (`prefers-color-scheme`) initialize default mode, or must Light always be default?
3. Is there a required accessibility contrast target (e.g., WCAG AA) to enforce for chart elements and custom timeline bars?
4. Should the theme toggle be available on all routes only in AppBar, or duplicated in dashboard controls?
5. Confirm final PR metadata requirements:
   - PR title includes `KAN-4`
   - PR description includes `https://heaptrace-demo.atlassian.net/browse/KAN-4`
