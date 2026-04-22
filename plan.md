# Feature Plan: KAN-4 — Add Dark and Light Theme Support

## Overview

- **Requirement**: Add robust Dark and Light theme support across the React dashboard, including readable widget/chart styling and consistent visual tokens.
- **Requested by**: Product work item (KAN-4)
- **Priority**: High
- **Estimated total effort**: L (3–6 hours)
- **Affected areas**:
  - `app/src/theme.ts`
  - `app/src/main.tsx`
  - `app/src/App.tsx`
  - `app/src/components/widgets/BPTrendChart.tsx`
  - `app/src/components/widgets/LabTrendChart.tsx`
  - `app/src/components/widgets/WidgetCard.tsx`
  - Potentially shared chart/widget styles in other widget files
- **Issue link**: https://heaptrace-demo.atlassian.net/browse/KAN-4

## User Stories

- As a clinician, I want to switch between Light and Dark themes so I can use the dashboard comfortably in different environments.
- As a clinician, I want charts and widget text to remain readable in both themes so I can quickly interpret trends.
- As a returning user, I want my theme preference remembered so I do not need to reconfigure it every visit.

## UI Mockups

### App Header + Theme Toggle (Desktop)

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ [♥] Hypertension Dashboard                               FHIR demo  [🌙/☀️]  │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  [Patient List / Dashboard content]                                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Light Theme (Default/Loaded)

```text
Background: light gray (#f4f6f9-ish)
Cards: white
Primary text: dark gray
Chart grid/reference lines: subtle low-contrast dark-on-light
```

### Dark Theme (Default/Loaded)

```text
Background: dark slate
Cards: elevated dark surface
Primary text: light gray/white
Chart grid/reference lines: subtle high-contrast light-on-dark
```

### Loading State (both themes)

```text
Theme toggle visible and interactive
Existing loading spinners/skeleton behavior unchanged
Contrast remains accessible in both modes
```

### Error/Empty State (both themes)

```text
Fallback text/chips/labels inherit theme tokens
No hard-coded light-only colors causing unreadable text
```

### Mobile Header

```text
┌───────────────────────────────┐
│ [♥] Dashboard      [🌙/☀️]     │
└───────────────────────────────┘
Toggle remains reachable without layout overflow
```

## Data Flow

```text
User clicks theme toggle in App header
        │
        ▼
App-level theme mode state updates ("light" | "dark")
        │
        ├── persisted to localStorage (e.g., "ht-theme-mode")
        │
        ▼
MUI createTheme(mode-aware palette + component overrides)
        │
        ▼
ThemeProvider re-renders app with new tokens
        │
        ├── layout/background/app bar colors update
        ├── widget cards/typography colors update
        └── chart styles (grid, axis, tooltip, reference visuals) update
```

## API Contracts

No backend API changes required.

Internal UI contract:

- `ThemeMode = 'light' | 'dark'`
- App shell exposes:
  - Current mode value
  - Toggle handler
- Theme preference persistence:
  - Read from `localStorage` on startup (with safe fallback)
  - Write on mode change

## Database Changes

None.

## Data/Fixture Changes

None expected (`server/src/fixtures/**` unchanged).

## Task Breakdown

### Task 1: Add mode-aware theme factory and tokens

- **Type**: Frontend
- **Description**: Refactor static light theme into a mode-aware theme creator with palette values for both light and dark surfaces/text/background, plus reusable chart-related tokens where needed.
- **Depends on**: None
- **Files likely involved**: `app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Add App-level theme state + persistence

- **Type**: Frontend
- **Description**: Introduce theme mode state initialization (with persisted preference), pass dynamic theme into `ThemeProvider`, and ensure safe SSR/client behavior assumptions for Vite SPA.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/main.tsx`
- **Estimated effort**: M

### Task 3: Add header theme toggle UI

- **Type**: Frontend
- **Description**: Add a compact toggle control in the app header that switches mode with clear iconography and accessible labeling.
- **Depends on**: Task 2
- **Files likely involved**: `app/src/App.tsx`
- **Estimated effort**: S

### Task 4: Standardize chart rendering for both themes

- **Type**: Frontend
- **Description**: Replace hard-coded chart colors (`#eee`, fixed fills/strokes) with theme-derived values so axes, grids, tooltips, and reference elements remain legible in dark mode.
- **Depends on**: Task 1
- **Files likely involved**:
  - `app/src/components/widgets/BPTrendChart.tsx`
  - `app/src/components/widgets/LabTrendChart.tsx`
  - Other chart widget files if any hard-coded light-only styling appears
- **Estimated effort**: M

### Task 5: Align shared widget surfaces and verify visual consistency

- **Type**: Frontend
- **Description**: Ensure shared card/surface components and frequently used typography honor the updated theme tokens without regressions.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/components/widgets/WidgetCard.tsx` (and minimal related widgets if needed)
- **Estimated effort**: S

### Task 6: Validate build + manual UI verification with screenshots

- **Type**: Testing
- **Description**: Run existing build checks and manually verify patient list/dashboard in both modes (including charts and readability), capturing screenshots for PR.
- **Depends on**: Tasks 1, 2, 3, 4, 5
- **Files likely involved**: No source changes expected unless fixes discovered
- **Estimated effort**: S

## Dependency Map

```text
Task 1 ──┬──> Task 2 ──> Task 3 ──┐
         ├──> Task 4 ─────────────┼──> Task 6
         └──> Task 5 ─────────────┘
```

Parallelizable after Task 1: Task 4 and Task 5.

## Risks & Edge Cases

### Risk Table

| Risk Area | Risk | Mitigation |
| --- | --- | --- |
| Visual consistency | Hard-coded colors in charts/widgets become unreadable in dark mode | Audit theme-sensitive components and switch to theme tokens |
| Accessibility | Insufficient contrast for labels/chips/tooltips | Verify contrast in both modes on key pages and adjust palette tokens |
| Persistence | Invalid localStorage value breaks mode init | Guard and fallback to `'light'` |
| UX continuity | Theme flashes on initial load | Initialize mode before first render where possible |
| Backward compatibility | Existing light mode appearance unexpectedly changes | Keep current light palette as baseline and adjust only where needed |
| Performance | Excessive theme recreation causing rerenders | Memoize dynamic theme creation by mode |

### Edge Case Checklist

- [ ] Missing/blocked localStorage still yields working default theme
- [ ] Unknown stored value gracefully falls back to light
- [ ] Toggle works on both patient list and dashboard routes
- [ ] Chart tooltip/grid/reference visuals remain readable in dark mode
- [ ] No clipping/overflow of toggle in narrow mobile width
- [ ] Existing loading and empty states remain legible in both modes

## Out of Scope

- Backend/FHIR endpoint changes
- Fixture regeneration or data model changes
- New design system overhaul beyond dark/light support
- Adding automated test framework if not already present

## Test Plan

1. Run existing app build check:
   - `npm --workspace app run build`
2. Manual smoke verification via `npm run dev`:
   - Visit `/` and `/patients/patient-persimmon`
   - Toggle theme repeatedly and confirm persistence after refresh
   - Verify key widgets/charts (BP trend, lab trend, vitals) in both modes
   - Verify mobile-width layout for header toggle
3. Capture screenshots:
   - Light mode dashboard
   - Dark mode dashboard
   - At least one chart in each mode showing readability

## Open Questions

- Should initial mode default to system preference (`prefers-color-scheme`) when no saved preference exists, or always light?
- Is theme toggle placement in the top app bar acceptable, or should it live in a settings menu?
- Are there brand constraints for dark palette values beyond accessibility/readability targets?
