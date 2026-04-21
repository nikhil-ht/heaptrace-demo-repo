# Feature Plan: KAN-4 — Add Dark and Light Theme Support

## Overview

- **Requirement**: Add first-class support for both Light and Dark themes with consistent UI and standardized graph appearance.
- **Requested by**: Jira work item KAN-4
- **Priority**: High
- **Estimated total effort**: L (about 5–6 hours including validation)
- **Affected areas**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx`

## User Stories

- As a clinician, I want to switch between Light and Dark modes so I can use the dashboard comfortably in different environments.
- As a clinician, I want charts and timeline visuals to remain readable in both themes so trends are interpretable without visual strain.
- As a product team member, I want color usage to be theme-aware and consistent so UI styling is standardized and easier to maintain.

## UI Mockups

### 1) Desktop — Default loaded state (Light)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ [❤] Hypertension Dashboard                                  [🌙 Dark mode] │
├────────────────────────────────────────────────────────────────────────────┤
│ Patient header + widgets (cards use light surfaces, subtle borders)       │
│                                                                            │
│ Blood Pressure Trend                                                       │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ gridlines (light divider), text (dark), SBP/DBP lines theme tokens   │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2) Desktop — Default loaded state (Dark)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ [❤] Hypertension Dashboard                                 [☀ Light mode] │
├────────────────────────────────────────────────────────────────────────────┤
│ Patient header + widgets (dark surfaces, elevated contrast text)          │
│                                                                            │
│ Blood Pressure Trend                                                       │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ gridlines (dark divider), text (light), SBP/DBP lines theme tokens   │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3) Loading state (both themes)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ App bar + theme toggle visible                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                         [ CircularProgress ]                               │
│                     Loading patient dashboard...                           │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4) Empty chart state (both themes)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Blood Pressure Trend                                       [3m 6m 1y all] │
├────────────────────────────────────────────────────────────────────────────┤
│ No readings available for selected range.                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5) Mobile view

```text
┌──────────────────────────────┐
│ [❤] Dashboard   [🌙/☀]       │
├──────────────────────────────┤
│ Widgets stack vertically      │
│ Charts keep contrast + labels │
└──────────────────────────────┘
```

## Data Flow

```text
┌──────────────┐        toggle click        ┌───────────────────────────────┐
│   User (UI)  │ ─────────────────────────▶ │ App-level theme mode state    │
└──────────────┘                            │ (light|dark)                  │
        ▲                                   └──────────────┬────────────────┘
        │                                                  │
        │ re-render with updated theme                    │ persist/read
        │                                                  ▼
┌───────────────────────┐  theme object           ┌──────────────────────────┐
│ MUI ThemeProvider     │ ◀────────────────────── │ localStorage preference  │
│ + CssBaseline         │                         │ (e.g. "themeMode")       │
└───────────┬───────────┘                         └──────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ Widgets + Recharts components consume theme tokens for lines/grid/text/   │
│ surfaces so visuals remain readable in both modes                          │
└────────────────────────────────────────────────────────────────────────────┘
```

## API Contracts

### Backend endpoints
- **No backend API contract changes required**.
- Existing FHIR routes remain unchanged.

### Client-side persistence contract
- **Storage key**: `themeMode`
- **Allowed values**: `light` | `dark`
- **Read timing**: app bootstrap (before first render where possible)
- **Write timing**: on theme toggle action
- **Fallback**: default to `light` if missing/invalid

## Data/Fixture Changes

- No fixture or mock FHIR bundle changes required.
- No backend data model changes required.

## Task Breakdown

### Task 1: Refactor theme setup for dual-mode tokens
- **Type**: Frontend
- **Description**: Replace single static theme export with theme factory (or equivalent) that supports `light` and `dark` palettes, including background/surface/text/divider tokens used by existing pages/widgets.
- **Depends on**: None
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Add app-level theme mode state and toggle control
- **Type**: Frontend
- **Description**: Introduce toggle UI in top app bar, wire theme mode state into `ThemeProvider`, and persist preference in localStorage.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
- **Estimated effort**: M

### Task 3: Standardize chart styling with theme-aware colors
- **Type**: Frontend
- **Description**: Remove hardcoded chart colors where they impact readability, derive grid/tick/reference/series colors from theme tokens while preserving semantic distinction between metrics.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
- **Estimated effort**: M

### Task 4: Standardize encounters timeline theme behavior
- **Type**: Frontend
- **Description**: Make timeline chips/bars/labels readable in both modes by moving away from fixed colors for non-semantic visual elements and applying theme-aware contrast rules.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx`
- **Estimated effort**: M

### Task 5: Validate visual behavior and build
- **Type**: Frontend / Verification
- **Description**: Verify both themes manually on `/` and `/patients/patient-persimmon`; confirm charts/timeline readability and run `npm --workspace app run build`.
- **Depends on**: Tasks 2, 3, 4
- **Files likely involved**: No intentional source changes (unless bug fixes from validation)
- **Estimated effort**: S

## Dependency Map

```text
Task 1 ──▶ Task 2 ──┐
   ├────▶ Task 3 ────┼──▶ Task 5
   └────▶ Task 4 ────┘
```

Parallelizable after Task 1: Tasks 3 and 4 can proceed independently while Task 2 is implemented.

## Risks & Edge Cases

### Risk Assessment

| Risk Area | Risk | Mitigation |
|---|---|---|
| Readability/contrast | Some hardcoded chart/timeline colors may fail contrast in dark mode | Centralize color tokens and verify key text/line combinations manually in both modes |
| UI consistency | Partial migration leaves mixed hardcoded and theme-based styles | Audit all major chart/timeline components touched by KAN-4 scope |
| Persistence | Invalid localStorage value can break mode initialization | Guard with strict allowed values and fallback to light |
| Regression | App bar modifications may affect navigation layout on small screens | Validate mobile-width rendering for title + toggle alignment |
| Third-party rendering | Recharts default tooltip/axes may inherit unexpected colors in dark mode | Explicitly set key style props from MUI theme palette |

### Edge Cases Checklist

- [ ] First load with no saved preference defaults to light mode
- [ ] Saved preference survives page refresh
- [ ] Invalid saved value falls back safely without runtime errors
- [ ] Toggle remains usable on narrow/mobile width
- [ ] Chart text/grid/tooltip stays readable in dark mode
- [ ] Empty datasets remain legible and consistent in both themes
- [ ] Existing clinical threshold cues (e.g., reference lines/bands) remain visually distinct

## Out of Scope

- Adding additional theme variants beyond Light/Dark
- Server-side user profile/theme preference persistence
- Broad redesign of spacing/layout/typography unrelated to theme support
- Backend API or fixture data changes

## Test Plan

- Manual validation:
  - Visit `/` and `/patients/patient-persimmon` in Light mode and Dark mode.
  - Verify app bar toggle behavior and persistence across refresh.
  - Verify BP, lab charts, and encounters timeline readability/contrast.
- Build/type-check:
  - Run `npm --workspace app run build`.
- Regression smoke:
  - Ensure existing navigation and data loading behavior remains unchanged.

## Open Questions

1. Should the default mode remain always `light`, or should it prefer system setting when no saved preference exists?
2. Is a simple icon toggle sufficient, or is a labeled toggle/switch required for accessibility/design consistency?
3. Should theme preference be per-browser (localStorage) only, or eventually tied to authenticated user settings?
4. Are specific color accessibility targets (e.g., WCAG AA contrast threshold) required as acceptance criteria for KAN-4?
