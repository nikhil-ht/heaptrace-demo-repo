# Project: Hypertension FHIR Dashboard

Clinician dashboard for hypertensive patients, backed by a mock FHIR server. npm workspaces monorepo (`app/`, `server/`).

## Tech Stack
- Frontend: React 18 + TypeScript + Vite, MUI, MUI X Data Grid, Recharts, TanStack Query, React Router, Axios
- Backend: Node.js + Express (ESM), serves FHIR-shaped JSON fixtures
- Database: None — static JSON fixtures in `server/src/fixtures/`
- Testing: None currently configured

## Coding Standards
- No `any` types. Early returns. All endpoints validate input.
- Keep FHIR response shapes authentic (LOINC codes, Bundle/Resource structure).
- Frontend talks to the backend via the Vite `/fhir/*` proxy — do not hardcode `http://localhost:4100`.
- All features must have tests (once a test runner is added).

## Skills

Custom skills are defined in `.github/skills/`. When a user invokes a skill by name (e.g. "Use the feature-plan skill"), read the corresponding `SKILL.md` and follow its instructions exactly.

| Skill name     | File                                      | Purpose                                      |
| -------------- | ----------------------------------------- | -------------------------------------------- |
| `feature-plan` | `.github/skills/feature-plan/SKILL.md`   | Plan a new feature — tasks, mockups, risks   |
| `feature-work` | `.github/skills/feature-work/SKILL.md`   | Implement an approved feature plan           |
| `find-fix`     | `.github/skills/find-fix/SKILL.md`       | Diagnose and fix a bug                       |
| `test-gen`     | `.github/skills/test-gen/SKILL.md`       | Generate tests for existing code             |

## Required Before Commit
- `npm run build` succeeds (runs `tsc -b` then `vite build`).
- Both `npm run dev:server` and `npm run dev:app` start cleanly.
- Linter and tests pass once configured.