# Testing Instructions

## Current State

There is no automated test suite yet. CI currently verifies:

- `npm ci` installs cleanly
- Fixture scripts regenerate without error
- `npm --workspace app run build` passes (includes `tsc -b` type-check)
- The backend boots and responds to `/health` and `/fhir/Patient`

Until a test suite is added, the loose contract is: every PR that touches widgets
or FHIR parsing must be manually exercised with `npm run dev` against
`/patients/patient-persimmon` (dense real data) and one synthetic patient
(`/patients/patient-001`).

## When Adding Tests

### Recommended stack
- **Vitest** as the test runner (native to Vite; no extra config needed)
- **React Testing Library** for component tests
- **MSW (Mock Service Worker)** to intercept `/fhir/*` calls for widget and hook tests
- **Supertest** for Express endpoint tests on `server/src/routes/fhir.js`
- **Playwright** for a small e2e suite — patient list → dashboard navigation,
  range selector toggles, timeline hover tooltips

### Test placement
- Co-locate unit tests next to source: `Widget.tsx` → `Widget.test.tsx`
- Integration tests for hooks: `useFhir.test.ts` with MSW handlers
- Backend tests: `server/src/routes/fhir.test.js`
- E2E: `app/e2e/` with `playwright.config.ts`

### What to prioritize covering
1. **`utils/fhir.ts`** — pure functions, high-leverage. Critical cases:
   - `parseBPPanel` — returns `null` on missing components
   - `classifyBP` — boundary values 129/79, 130/80, 139/89, 140/90
   - `formatHumanName` / `getMRN` — multiple identifier shapes (`type.coding[0].code === 'MR'` vs. `system` contains "mrn")
   - `filterByRange` — 3m, 6m, 1y, all
2. **`fhirClient`** — Bundle unwrapping when `entry` is missing or empty
3. **Widgets with fallback logic** — `CurrentMedicationsWidget` (dose parsed from name, dedupe by RxNorm code), `EncountersWidget` (missing `reasonCode`), `AdherenceWidget` (missing `valueCodeableConcept`)
4. **Backend** — correct 404 on unknown patient; `code` query filters actually narrow the Bundle; required `patient` param returns 400
5. **`EncountersTimeline`** — minimum bar width, domain spans the right window

### Fixture data for tests
- Reuse `server/src/fixtures/bundles/*.json` as test data — it reflects real
  FHIR shapes including the imperfections (missing `reasonCode`, bare
  `dosageInstruction.text`, etc.)
- Add deliberately malformed bundles under a `__fixtures__/` directory for
  negative-case tests (missing components, wrong LOINC, non-numeric quantities)

### CI integration
When tests are added, extend `.github/workflows/pull-request.yml` with:

```yaml
- run: npm --workspace app run test -- --run
- run: npm --workspace server run test
```
