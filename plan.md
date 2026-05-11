# Feature Plan: KAN-6 — Add Dark and Light Theme Support

## Overview

- **Requirement**: Add support for both dark and light themes with consistent readability and chart styling.
- **Requested by**: Product work item (KAN-6)
- **Issue link**: https://heaptrace-demo.atlassian.net/browse/KAN-6
- **Priority**: Medium
- **Estimated total effort**: L (4–6 hours including integration and manual verification)
- **Affected areas**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/WidgetCard.tsx` (if contrast polish is needed)

## User Stories

- As a clinician, I want to switch between light and dark themes so I can use the dashboard comfortably in different environments.
- As a clinician, I want charts and widgets to remain readable in both themes so trend interpretation is not impacted by styling differences.
- As a returning user, I want the previously selected theme to persist so I do not need to reconfigure it every visit.

## UI Mockups

### Desktop — Default (Light)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🫀 Hypertension Dashboard                                  [☀ Light ▾]      │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Patient List / Dashboard Content]                                           │
│                                                                              │
│  ┌──────────────────────────┐   ┌─────────────────────────────────────────┐  │
│  │ Widget Card (surface)    │   │ BP Trend Chart                         │  │
│  │ Text uses primary/secondary│  │ Grid/axes/reference lines theme-aware │  │
│  └──────────────────────────┘   └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop — Dark

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🫀 Hypertension Dashboard                                   [🌙 Dark ▾]      │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Patient List / Dashboard Content]                                           │
│                                                                              │
│  ┌──────────────────────────┐   ┌─────────────────────────────────────────┐  │
│  │ Widget Card (dark surface)│  │ BP Trend Chart                          │  │
│  │ High-contrast text/chips  │  │ Grid/axes/reference lines theme-aware   │  │
│  └──────────────────────────┘   └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Loading State

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ App shell renders with selected theme (no flash of opposite theme)          │
│ Center spinner and placeholders inherit theme colors                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Error State

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Theme selector still available                                                │
│ "Failed to load patients" / dashboard errors remain readable in both modes   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Mobile View

```text
┌───────────────────────────────┐
│ 🫀 Dashboard   [☀/🌙 icon]     │
├───────────────────────────────┤
│ Stacked widgets               │
│ Theme toggle remains visible  │
└───────────────────────────────┘
```

## Data Flow

```text
User clicks theme toggle in AppBar
        │
        ▼
setThemeMode('light' | 'dark') in app state
        │
        ├── persist to localStorage (e.g., "themeMode")
        │
        ▼
createTheme(themeMode) -> ThemeProvider receives updated theme
        │
        ▼
MUI + widget/chart components re-render with palette-aware tokens
        │
        ▼
Consistent surfaces, text, and chart readability in selected mode
```

## API Contracts

- **No backend API changes required**.
- FHIR endpoints and payload contracts remain unchanged.

## Data/Fixture Changes

- **No fixture or server data changes required**.
- Existing bundles and synthetic fixture generation scripts are unaffected.

## Task Breakdown

### Task 1: Implement dual-theme token system in app theme setup

- **Type**: Frontend
- **Description**: Replace single exported light theme with a mode-aware theme factory (light/dark palettes, surface/background/text tokens, chart helper tokens if needed).
- **Depends on**: None
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Add theme mode state, persistence, and ThemeProvider wiring

- **Type**: Frontend
- **Description**: Add app-level theme mode state with initial value from localStorage (fallback light), update ThemeProvider to consume mode-based theme, persist on changes.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
- **Estimated effort**: M

### Task 3: Add user-facing theme toggle in application shell

- **Type**: Frontend
- **Description**: Add a compact toggle control in the app header to switch light/dark mode while keeping existing layout responsive.
- **Depends on**: Task 2
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
- **Estimated effort**: S

### Task 4: Standardize chart and widget appearance across themes

- **Type**: Frontend
- **Description**: Remove hard-coded chart/grid/reference colors where needed and derive from theme palette to keep readability in both modes; apply any widget contrast polish.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/WidgetCard.tsx` (optional)
- **Estimated effort**: M

### Task 5: Verify UX and build readiness for both themes

- **Type**: Frontend / Validation
- **Description**: Build app, run dev flow manually on `/` and `/patients/patient-persimmon` + `/patients/patient-001`, capture screenshots for light/dark states.
- **Depends on**: Tasks 2, 3, 4
- **Files likely involved**: No source file changes expected (unless polish fixes are needed)
- **Estimated effort**: M

## Dependency Map

```text
Task 1 (theme tokens) ──┬──> Task 2 (provider + persistence) ──> Task 3 (toggle UI)
                        └──> Task 4 (chart/widget theme alignment)

Task 2 + Task 3 + Task 4 ──> Task 5 (build + manual verification + screenshots)
```

## Risks & Edge Cases

### Risk Assessment

| Risk Area | Risk | Mitigation |
| --- | --- | --- |
| UX consistency | Hard-coded chart colors become unreadable in dark mode | Move key chart colors/grid/labels to theme-derived tokens |
| Readability/accessibility | Text or chip contrast insufficient in dark surfaces | Use palette text tokens and verify contrast on key widgets |
| State persistence | Theme resets on refresh | Persist mode in localStorage and hydrate before first render |
| Visual regression | Existing light-mode appearance unintentionally shifts | Keep light palette aligned with current colors and manually compare |
| Compatibility | Third-party components (DataGrid/Recharts tooltips) may not inherit dark styles cleanly | Add targeted sx/theme overrides where required |

### Edge Case Checklist

- [ ] First load with no saved preference defaults to light mode.
- [ ] Invalid stored theme value safely falls back to light mode.
- [ ] Theme switching works from both patient list and patient dashboard routes.
- [ ] Chart tooltips, axes, grid lines, and reference markers remain readable in dark mode.
- [ ] Empty/loading/error states remain legible in both themes.
- [ ] Mobile header keeps theme control accessible without layout overlap.

## Out of Scope

- Any backend/FHIR API changes.
- New user profile settings endpoint for theme persistence.
- Expanding theme variants beyond light and dark.
- Broad redesign of layout or widget information architecture.

## Test Plan

1. **Build validation**
   - Run: `npm --workspace app run build`
2. **Manual verification**
   - Run: `npm run dev`
   - Validate both light and dark modes on:
     - `/`
     - `/patients/patient-persimmon`
     - `/patients/patient-001`
   - Confirm chart readability (BP, labs, timeline) and DataGrid visibility in both themes.
3. **Persistence check**
   - Switch theme, refresh browser, confirm mode is retained.
4. **Screenshots for PR**
   - Capture light and dark views for patient list and dashboard.

## Open Questions

- Should the default mode honor system preference (`prefers-color-scheme`) when no localStorage value exists, or always default to light?
- Preferred toggle UX: icon-only switch, labeled switch, or menu selection in AppBar?
- Is there a required contrast/accessibility standard to explicitly satisfy (e.g., WCAG AA target) for this work item?
