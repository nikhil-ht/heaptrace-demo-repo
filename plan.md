# Feature Plan: KAN-4 — Dark and Light Theme Support

## Overview

- **Requirement**: Add full dark/light theme support with consistent readability and graph styling.
- **Requested by**: Product work item KAN-4.
- **Priority**: High.
- **Estimated total effort**: L (3–6 hours).
- **Affected areas**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/pages/PatientDashboardPage.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx`

## User Stories

- As a clinician, I want to switch between light and dark themes so I can use the app comfortably in different lighting conditions.
- As a clinician, I want chart colors and contrast to remain readable in both themes so clinical values are easy to interpret.
- As a product owner, I want a consistent visual system across widgets/pages so the app looks standardized regardless of theme.

## UI Mockups

### 1) App shell (Light mode)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Hypertension Dashboard                                   [☀ Light▼] │
├──────────────────────────────────────────────────────────────────────┤
│ Patient List / Dashboard widgets                                      │
│ - Light surfaces                                                     │
│ - Consistent card backgrounds                                        │
│ - Chart grid and axis optimized for light contrast                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2) App shell (Dark mode)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Hypertension Dashboard                                    [🌙 Dark▼] │
├──────────────────────────────────────────────────────────────────────┤
│ Patient List / Dashboard widgets                                      │
│ - Dark surfaces                                                      │
│ - Accessible text contrast                                           │
│ - Chart lines, bands, and reference markers tuned for dark mode     │
└──────────────────────────────────────────────────────────────────────┘
```

### 3) Loading/empty/error visual expectations

```text
Loading:  [spinner] with themed background/text colors
Empty:    "No data" text uses text.secondary in current theme
Error:    Existing error messaging kept; ensure contrast in dark mode
```

## Data Flow

```text
User clicks theme control
   │
   ▼
Theme mode state (light | dark) updates in frontend
   │
   ├─► Persist preference (localStorage)
   │
   └─► MUI ThemeProvider receives recalculated theme object
            │
            ├─► App shell colors update
            ├─► Widgets pick themed tokens
            └─► Recharts color props derived from theme-aware palette
```

## API Contracts

- No backend API changes.
- No new HTTP endpoints.

## Database Changes

- None.

## Data/Fixture Changes

- None.

## Task Breakdown

### Task 1: Add theme mode state and persistence

- **Type**: Frontend
- **Description**: Introduce light/dark mode state, load initial value from local storage (or system fallback), and persist user selection.
- **Depends on**: None
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Define dual MUI palette tokens

- **Type**: Frontend / Design system
- **Description**: Refactor single static theme into theme factory for both modes (background, text, divider, primary/secondary harmonization).
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
- **Estimated effort**: M

### Task 3: Add theme switch control in app shell

- **Type**: Frontend
- **Description**: Add a compact mode toggle in top app bar and wire it to mode state.
- **Depends on**: Task 1, Task 2
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
- **Estimated effort**: S

### Task 4: Standardize chart/timeline colors for both themes

- **Type**: Frontend
- **Description**: Replace hardcoded chart/timeline colors with theme-aware tokens to keep readability and consistent appearance in both modes.
- **Depends on**: Task 2
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/pages/PatientDashboardPage.tsx`
- **Estimated effort**: M

### Task 5: Verify UI consistency manually in both primary routes

- **Type**: Verification
- **Description**: Validate `/` and `/patients/patient-persimmon` in light/dark, including chart readability and chip/bar contrast.
- **Depends on**: Task 3, Task 4
- **Files likely involved**: N/A (manual verification)
- **Estimated effort**: S

## Dependency Map

```text
Task 1 ──► Task 2 ──┬──► Task 3 ──┐
                    └──► Task 4 ──┴──► Task 5
```

## Risks & Edge Cases

### Risk Table

| Risk Area | Risk | Mitigation |
| --- | --- | --- |
| Accessibility | Insufficient contrast in dark mode (text, lines, grid) | Use palette tokens and verify visually across widgets/charts |
| Visual consistency | Mixed hardcoded colors and themed colors produce inconsistent look | Centralize colors in theme and replace literals in charts/timeline |
| Persistence | Theme resets unexpectedly across reloads | Persist mode in localStorage with safe fallback |
| Recharts styling | Some chart elements do not auto-inherit MUI theme | Explicitly pass theme-derived colors into chart props |
| Regression | Existing light mode appearance unintentionally degraded | Verify both themes on patient list and dashboard routes |

### Edge Case Checklist

- [ ] First load with no saved preference.
- [ ] Invalid saved preference value in localStorage.
- [ ] Theme switch while viewing heavy dashboard layout.
- [ ] Empty chart/timeline datasets in both modes.
- [ ] Tooltip readability in dark mode.
- [ ] Timeline bars/chips maintain contrast and legibility in both modes.

## Out of Scope

- Adding per-widget custom theme editors.
- Backend/user-profile persisted theme preference.
- Redesigning layout, spacing, or widget information architecture.
- Introducing new chart libraries or replacing Recharts.

## Test Plan

- Build validation: `npm --workspace app run build`.
- Manual checks in dev mode:
  - `/` patient list in light and dark.
  - `/patients/patient-persimmon` dashboard in light and dark.
  - `/patients/patient-001` dashboard spot-check for sparse data.
- Confirm chart elements (grid, lines, reference indicators, tooltip content) remain readable across both themes.

## Open Questions

- Should the initial mode default to system preference or fixed light mode when no saved preference exists?
- Is the theme switch expected in app bar only, or also in future user settings?
- Are there branding constraints for dark mode primary/secondary colors beyond current palette?
