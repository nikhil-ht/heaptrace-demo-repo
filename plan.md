# Feature Plan: KAN-5 — Add Dark and Light Theme Support

## Overview

- **Requirement**: Add support for both Light and Dark themes with consistent widget, typography, and chart readability.
- **Requested by**: Jira work item KAN-5.
- **Priority**: High.
- **Estimated total effort**: M–L (about 4–6 hours including verification).
- **Affected areas**:
  - `app/src/theme.ts`
  - `app/src/main.tsx`
  - `app/src/App.tsx`
  - `app/src/components/widgets/BPTrendChart.tsx`
  - `app/src/components/widgets/LabTrendChart.tsx`
  - `app/src/components/widgets/EncountersTimeline.tsx`
  - Potentially shared chart styling helper under `app/src/utils/` or `app/src/theme.ts`

## User Stories

- As a clinician, I want to switch between Light and Dark themes so I can use the dashboard comfortably in different environments.
- As a clinician, I want chart lines, reference bands, and grid lines to remain readable in either theme so trends stay interpretable.
- As a product team member, I want consistent theme application across pages and widgets so the UI looks standardized.

## UI Mockups

### 1) App shell — Light mode (default)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Hypertension Dashboard                                  [🌙 Dark mode]    │
├────────────────────────────────────────────────────────────────────────────┤
│ Patient Header                                                             │
│ ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│ │ BP Trend            │  │ eGFR Trend          │  │ Potassium Trend     │ │
│ │ (light background)  │  │ (light chart grid)  │  │ (reference bands)   │ │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│ ┌──────────────────────────────── Encounters Timeline ───────────────────┐ │
│ │ Colored bars with readable text and timeline ticks                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2) App shell — Dark mode

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Hypertension Dashboard                                  [☀️ Light mode]   │
├────────────────────────────────────────────────────────────────────────────┤
│ Patient Header                                                             │
│ ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│ │ BP Trend            │  │ eGFR Trend          │  │ Potassium Trend     │ │
│ │ (dark surface)      │  │ (muted dark grid)   │  │ (contrast-safe band)│ │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│ ┌──────────────────────────────── Encounters Timeline ───────────────────┐ │
│ │ Class colors tuned for dark bg; labels and tooltips remain legible     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3) Loading / error / empty state behavior

```text
Loading: existing spinners/skeleton behavior remains unchanged; only colors follow theme tokens.
Error: existing error text and buttons remain unchanged; theme palette controls contrast.
Empty: "No data" messaging remains unchanged; text uses theme semantic colors.
```

### 4) Mobile header behavior

```text
┌──────────────────────────────┐
│ Hypertension Dashboard  [🌓] │
├──────────────────────────────┤
│ Same toggle in AppBar, icon  │
│ button-sized for touch usage │
└──────────────────────────────┘
```

## Data Flow

```text
┌────────────┐    click toggle    ┌───────────────────────────┐
│ User (UI)  │ ─────────────────▶ │ Theme state (mode)        │
└────────────┘                    │ - light | dark            │
                                  │ - persisted (localStorage)│
                                  └──────────────┬────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────┐
                                  │ MUI ThemeProvider         │
                                  │ createTheme(mode, tokens) │
                                  └──────────────┬────────────┘
                                                 │
          ┌──────────────────────────────────────┼─────────────────────────────────────┐
          ▼                                      ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐               ┌──────────────────────┐
│ App shell components │              │ Widgets / cards      │               │ Recharts components  │
│ AppBar, pages        │              │ Typography / chips    │               │ grid/line/bands      │
└──────────────────────┘              └──────────────────────┘               └──────────────────────┘
```

## API Contracts

No backend or FHIR API contract changes required.

## Database / Data / Fixture Changes

- **Database changes**: None.
- **Fixture changes**: None.
- **Client-side persistence**: Store selected theme mode (`light` / `dark`) in browser `localStorage`.

## Task Breakdown

### Task 1: Add theme mode model and tokenized palettes

- **Type**: Frontend
- **Description**: Refactor `theme.ts` from a single static light theme to mode-driven theme creation (`light` + `dark`) with palette values for background, text, divider, and chart-friendly color tokens.
- **Depends on**: None
- **Files likely involved**: `app/src/theme.ts`
- **Estimated effort**: M

### Task 2: Add app-level theme state + persistence

- **Type**: Frontend
- **Description**: Introduce mode state in app bootstrap (or a small theme context), initialize from `localStorage`/system preference, and wrap `ThemeProvider` with dynamic theme generation.
- **Depends on**: Task 1
- **Files likely involved**: `app/src/main.tsx` (and optionally a small provider file under `app/src/`)
- **Estimated effort**: M

### Task 3: Add user-facing theme toggle control

- **Type**: Frontend
- **Description**: Add a compact toggle in the top app bar to switch light/dark mode, with accessible label and clear current-state iconography.
- **Depends on**: Task 2
- **Files likely involved**: `app/src/App.tsx` (or small shared toggle component)
- **Estimated effort**: S

### Task 4: Standardize chart/timeline colors across themes

- **Type**: Frontend
- **Description**: Replace hard-coded chart/timeline colors with theme-aware values to maintain readability in both modes (grid lines, reference lines/bands, data lines, timeline class colors).
- **Depends on**: Task 1
- **Files likely involved**:
  - `app/src/components/widgets/BPTrendChart.tsx`
  - `app/src/components/widgets/LabTrendChart.tsx`
  - `app/src/components/widgets/EncountersTimeline.tsx`
- **Estimated effort**: M

### Task 5: Manual verification + build validation

- **Type**: Frontend/Validation
- **Description**: Run `npm --workspace app run build`; manually verify `/` and `/patients/patient-persimmon` + `/patients/patient-001` in both themes, including chart readability and timeline legibility.
- **Depends on**: Tasks 2, 3, 4
- **Files likely involved**: no source changes expected unless fixes discovered
- **Estimated effort**: S

## Dependency Map

```text
Task 1 (theme tokens)
  ├── Task 2 (app-level mode + persistence)
  │      └── Task 3 (AppBar toggle)
  └── Task 4 (theme-aware chart/timeline styling)

Task 5 (validation) depends on Task 2 + Task 3 + Task 4.
```

## Risks & Edge Cases

### Key Risks

| Risk Area | Risk | Mitigation |
|---|---|---|
| Readability | Dark mode chart lines/reference markers may blend into background | Use explicit contrast-tested token values and verify against card backgrounds |
| Consistency | Some components still use hard-coded hex values | Audit key widgets and replace with theme tokens or semantic palette values |
| UX persistence | Theme resets on refresh | Persist mode in `localStorage` and hydrate on app start |
| Accessibility | Toggle unclear for screen readers | Add descriptive `aria-label` and state-aware tooltip/title |
| Regression | Existing light mode visual behavior shifts unintentionally | Keep current light palette as baseline and validate both key pages |

### Edge Case Checklist

- [ ] First load with no saved preference (fallback strategy defined).
- [ ] Invalid `localStorage` value (fallback to light/system default).
- [ ] User toggles mode on dashboard pages with heavy charts.
- [ ] Tooltip/text contrast remains readable in both modes.
- [ ] Timeline bars remain distinguishable from background in dark mode.
- [ ] Existing loading/error/empty states remain visually clear.
- [ ] Mobile header/toggle remains usable.

## Out of Scope

- Per-widget custom theme overrides unrelated to readability.
- New branding/color redesign beyond adding robust dark/light support.
- Backend, FHIR endpoint, fixture, or data-model changes.
- Automated test framework introduction (none currently exists).

## Test Plan

### Build / static validation

- Run `npm --workspace app run build`.

### Manual verification

- Run `npm run dev` and verify:
  - Patient list page (`/`) in light and dark mode.
  - Patient dashboard (`/patients/patient-persimmon`) in both modes.
  - One synthetic patient (`/patients/patient-001`) in both modes.
- Confirm:
  - Toggle updates UI immediately and persists after refresh.
  - BP/Lab charts and timeline have readable lines/text in both modes.
  - Graph appearance remains standardized and consistent.

## Open Questions

1. Should default mode be **system preference** or explicitly **light** when no prior setting exists?
2. Is toggle placement limited to AppBar only, or should it appear in additional settings UI later?
3. Are there exact brand-approved dark palette values, or should we use clinically readable defaults aligned with existing primary/secondary colors?
4. Should chart color tokens be centralized in theme custom fields now, or deferred to a follow-up refactor after initial dark/light rollout?
