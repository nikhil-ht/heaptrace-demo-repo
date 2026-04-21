# Feature Plan: KAN-4 — Add support for Dark and Light theme

## Overview

- **Requirement**: Add full Dark and Light theme support for the dashboard UI with consistent, readable charts and widgets.
- **Requested by**: Work item KAN-4
- **Priority**: High
- **Issue link**: https://heaptrace-demo.atlassian.net/browse/KAN-4
- **Estimated total effort**: L (4–6 hours)
- **Affected areas**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx` (if contrast tuning is required)

## User Stories

- As a clinician, I want to switch between light and dark themes so I can use the dashboard comfortably in different lighting conditions.
- As a clinician, I want charts and graph annotations to remain readable in both themes so trend interpretation is not impacted.
- As a product team member, I want visual styles to be consistently theme-driven so future UI additions follow a single standard.

## UI Mockups

### App header + theme control (desktop, loaded)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ❤ Hypertension Dashboard                                   [☀ Light ▾]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Patient List / Dashboard content...]                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ❤ Hypertension Dashboard                                    [🌙 Dark ▾]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Patient List / Dashboard content in dark surfaces...]                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Chart widget appearance parity

```text
Light mode:
┌ Blood Pressure Trend ────────────────────────────────────────────────────────┐
│ grid: subtle gray, axis/labels: dark text, target lines readable            │
│ systolic/diastolic lines with strong contrast                                │
└───────────────────────────────────────────────────────────────────────────────┘

Dark mode:
┌ Blood Pressure Trend ────────────────────────────────────────────────────────┐
│ grid: low-contrast slate, axis/labels: light text, target lines readable    │
│ systolic/diastolic lines recolored or preserved where contrast is sufficient │
└───────────────────────────────────────────────────────────────────────────────┘
```

### State coverage

```text
Loading state: existing spinners remain theme-aware via MUI tokens.
Error state: existing error text uses semantic color in both modes.
Empty state: card and chart containers remain readable with themed surfaces.
Mobile: theme control remains accessible in AppBar without layout overflow.
```

## Data Flow

```text
User taps theme toggle (AppBar)
        │
        ▼
Theme mode state updates (light|dark)
        │
        ▼
MUI createTheme(mode) recomputes palette + component tokens
        │
        ▼
ThemeProvider propagates tokens to pages/widgets/charts
        │
        ▼
Recharts props consume theme-aware colors (grid/axis/tooltip/reference lines)
```

## API Contracts

No backend or HTTP API changes required.

## Data/Fixture Changes

No FHIR fixture or server data changes required.

## Task Breakdown

### Task 1: Introduce theme mode architecture

- **Type**: Frontend
- **Description**: Refactor static theme export into a mode-aware theme factory with light/dark palettes and shared typography/shape.
- **Depends on**: None
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Wire runtime theme switching in app shell

- **Type**: Frontend
- **Description**: Add theme mode state and header control (toggle/select) in app shell; feed selected mode into `ThemeProvider`.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/main.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/App.tsx`
- **Estimated effort**: M

### Task 3: Standardize chart and widget token usage

- **Type**: Frontend
- **Description**: Replace hard-coded chart/grid/reference colors with theme-driven values or mode-conditional tokens to preserve readability in both modes.
- **Depends on**: Task 1
- **Files likely involved**:
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/BPTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/LabTrendChart.tsx`
  - `/home/runner/work/heaptrace-demo-repo/heaptrace-demo-repo/app/src/components/widgets/EncountersTimeline.tsx` (if needed)
- **Estimated effort**: M

### Task 4: Validate visual consistency and build

- **Type**: Frontend / Validation
- **Description**: Run app build and manually verify patient list + dashboard in both modes, including chart readability and graph consistency.
- **Depends on**: Tasks 2, 3
- **Files likely involved**: No new files; verification-only
- **Estimated effort**: S

## Dependency Map

- Task 1 → prerequisite for Tasks 2 and 3.
- Tasks 2 and 3 can proceed in parallel after Task 1.
- Task 4 runs after both Tasks 2 and 3 are complete.

```text
Task 1
 ├── Task 2
 └── Task 3
      \ 
       └── Task 4 (after Task 2 + Task 3)
```

## Risks & Edge Cases

### Risk table

| Risk Area | Risk | Mitigation |
|---|---|---|
| Usability | Theme toggle placement causes AppBar crowding on smaller screens | Use compact icon/button pattern and verify at mobile widths |
| Readability | Existing hard-coded chart colors become low-contrast in dark mode | Move chart tokens to theme-aware colors and manually verify contrast |
| Consistency | Some widgets still use literal colors and look inconsistent | Audit critical widgets/charts touched by dashboard and align to tokens |
| Regression | Theme refactor breaks current light-mode styling | Keep light palette values aligned with existing baseline and verify both pages |
| Accessibility | Color-only distinctions become unclear in dark mode | Preserve line labels/legends and ensure non-color cues remain visible |

### Edge case checklist

- [ ] Default initial mode is deterministic (light by default unless persistence is introduced later)
- [ ] Theme switch does not break navigation or route transitions
- [ ] Chart axes/grid/tooltips remain readable in dark mode
- [ ] Reference lines/bands remain distinguishable in both modes
- [ ] DataGrid and card surfaces preserve sufficient contrast in both modes
- [ ] Loading/error states remain readable in both modes

## Out of Scope

- Persisting user theme preference to local storage or backend profile.
- OS-level `prefers-color-scheme` auto-detection behavior.
- Adding new widgets or backend resource endpoints.
- Non-theme UI redesign unrelated to readability/consistency.

## Test Plan

- Build validation:
  - `npm --workspace app run build`
- Manual validation via `npm run dev`:
  - Open patient list (`/`) in light mode, then dark mode.
  - Open dense dashboard (`/patients/patient-persimmon`) in both modes.
  - Verify BP/Lab charts (grid, labels, reference markers, tooltip contrast).
  - Verify DataGrid readability and AppBar/theme control behavior.
  - Capture screenshots of both theme states for PR review.

## Open Questions

- Should theme preference persist across sessions (local storage) in this ticket, or stay session-only?
- Should default mode be fixed to light, or follow system preference on first load?
- Is the expected theme control UX a binary toggle, icon button, or select in the AppBar?
