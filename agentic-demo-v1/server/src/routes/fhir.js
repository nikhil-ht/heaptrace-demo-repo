import { Router } from 'express';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, '..', 'fixtures');

const loadJSON = (file) => JSON.parse(readFileSync(file, 'utf8'));

const loadPatientBundle = (patientId) => {
  const file = path.join(FIXTURES, 'bundles', `${patientId}.json`);
  if (!existsSync(file)) return null;
  return loadJSON(file);
};

const patientsIndex = () => loadJSON(path.join(FIXTURES, 'patients.json'));

const bundleOf = (resources) => ({
  resourceType: 'Bundle',
  type: 'searchset',
  total: resources.length,
  entry: resources.map((resource) => ({ resource })),
});

const codingMatches = (coding = [], wanted) =>
  coding.some((c) => c.code === wanted);

const resourceHasCode = (resource, wanted) => {
  if (!wanted) return true;
  const codeField = resource.code?.coding;
  if (codeField && codingMatches(codeField, wanted)) return true;
  const category = resource.category;
  if (Array.isArray(category)) {
    return category.some((c) => codingMatches(c.coding, wanted));
  }
  return false;
};

const entriesByType = (bundle, type) =>
  (bundle?.entry ?? [])
    .map((e) => e.resource)
    .filter((r) => r?.resourceType === type);

const router = Router();

router.get('/Patient', (_req, res) => {
  const patients = patientsIndex().map((p) => {
    const bundle = loadPatientBundle(p.id);
    const patientResource = entriesByType(bundle, 'Patient')[0];
    return patientResource ?? p;
  });
  res.json(bundleOf(patients));
});

router.get('/Patient/:id', (req, res) => {
  const bundle = loadPatientBundle(req.params.id);
  const patient = entriesByType(bundle, 'Patient')[0];
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

const searchResource = (type) => (req, res) => {
  const { patient, code, status } = req.query;
  if (!patient) {
    return res.status(400).json({ error: 'patient parameter is required' });
  }
  const bundle = loadPatientBundle(patient);
  if (!bundle) return res.status(404).json({ error: 'Patient not found' });
  let resources = entriesByType(bundle, type);
  if (code) resources = resources.filter((r) => resourceHasCode(r, code));
  if (status) resources = resources.filter((r) => r.status === status);
  res.json(bundleOf(resources));
};

router.get('/Observation', searchResource('Observation'));
router.get('/Condition', searchResource('Condition'));
router.get('/MedicationRequest', searchResource('MedicationRequest'));
router.get('/Encounter', searchResource('Encounter'));
router.get('/AllergyIntolerance', searchResource('AllergyIntolerance'));

export default router;
