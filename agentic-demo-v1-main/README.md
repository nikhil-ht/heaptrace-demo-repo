# Hypertension FHIR Dashboard

Clinician dashboard for hypertensive patients, backed by a mock FHIR server.

## Stack
- **Backend:** Node.js + Express, serves FHIR-shaped JSON fixtures
- **Frontend:** React + Vite + TypeScript, MUI, Recharts, TanStack Query, React Router

## Quick start

```bash
npm install
npm run dev
```

- Backend: http://localhost:4100
- Frontend: http://localhost:5173

Vite proxies `/fhir/*` to the backend, so the client talks to real-looking FHIR endpoints.

## Layout

```
server/   Express FHIR mock (fixtures in src/fixtures/)
app/      React dashboard
```

## Data

Three synthetic patients with BP panels (LOINC 85354-9), serum K (2823-3),
eGFR (33914-3), self-reported adherence (71799-1), active medications
(RxNorm), conditions (ICD-10/SNOMED), encounters, and allergies.
