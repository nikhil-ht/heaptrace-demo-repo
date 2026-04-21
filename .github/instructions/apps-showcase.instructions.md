# Apps — `app/` and `server/`

This project is a two-workspace monorepo. Neither is a reusable library — they
are the application.

## `app/` — React Dashboard

### Purpose
Clinician-facing UI for hypertensive patient management. Entry points:

- `/` — patient list (MUI `DataGrid`)
- `/patients/:id` — single-patient dashboard (widget grid)

### Layering
1. **Pages** (`src/pages/`) — compose widgets, hold per-page state (e.g. `range: RangeKey`)
2. **Widgets** (`src/components/widgets/`) — pure presentation, accept FHIR resource arrays as props
3. **Hooks** (`src/hooks/useFhir.ts`) — TanStack Query wrappers, one per resource
4. **API** (`src/api/fhirClient.ts`) — axios wrapper; unwraps `Bundle.entry[].resource`
5. **Utils** (`src/utils/fhir.ts`) — parsers shared across widgets

### Conventions
- Vite dev proxy: `/fhir/*` → `http://localhost:4100`
- Never call axios directly from a widget — always go through a hook
- Widgets must tolerate missing/partial FHIR fields (the mock server returns real,
  imperfect data). Fall back to `text`, `code.text`, or parse from the medication
  display name when structured fields are absent.
- All FHIR queries are keyed by `[resource, patientId, params]` — invalidate only
  what you must on writes (no writes today)

### Styling
- MUI theme in `src/theme.ts` (primary `#1565c0`, secondary teal)
- Use MUI primitives (`Paper`, `Card`, `Grid`, `Chip`, `Stack`) before reaching for raw CSS
- Responsive: widgets collapse from `md={4}` / `md={6}` to `xs={12}` on small screens

## `server/` — FHIR Mock

### Purpose
Stand in for a real FHIR R4 server. Mirrors the REST API shape so the frontend
code is write-once.

### Endpoints
- `GET /health`
- `GET /fhir/Patient` — Bundle of all patients (drives the list view)
- `GET /fhir/Patient/:id`
- `GET /fhir/Condition?patient=:id`
- `GET /fhir/Observation?patient=:id&code=:loinc`
- `GET /fhir/MedicationRequest?patient=:id[&status=active]`
- `GET /fhir/Encounter?patient=:id`
- `GET /fhir/AllergyIntolerance?patient=:id`

### Fixture pipeline
- `src/fixtures/data/*.txt` — raw vendor data (real FHIR JSON, read-only)
- `scripts/build-anole-bundle.js` — merges `data/*.txt` + generated 12-month
  supplementary observations (BP, eGFR, HR, RR, O₂, temp, weight, BMI, adherence,
  allergies) into `src/fixtures/bundles/patient-persimmon.json`
- `scripts/generate-fixtures.js` — produces 3 synthetic patients
  (`patient-001..003.json`)
- `src/fixtures/patients.json` — patient index used by `/fhir/Patient`

### Adding a new endpoint or resource
1. Add a route in `src/routes/fhir.js` using the `searchResource('ResourceType')`
   helper when possible
2. Ensure the generator script emits the resource type into the patient bundle
3. Add a `useX(patientId)` hook in `app/src/hooks/useFhir.ts`
4. Extract a parser into `app/src/utils/fhir.ts` if multiple widgets need it
