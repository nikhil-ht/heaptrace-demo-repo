// Generates FHIR Bundle fixtures for the 3 seed patients.
// Run: node scripts/generate-fixtures.js
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(__dirname, '..', 'src', 'fixtures');
mkdirSync(path.join(FIX, 'bundles'), { recursive: true });

const patients = JSON.parse(readFileSync(path.join(FIX, 'patients.json'), 'utf8'));

const LOINC = 'http://loinc.org';
const SNOMED = 'http://snomed.info/sct';
const ICD10 = 'http://hl7.org/fhir/sid/icd-10-cm';
const RXNORM = 'http://www.nlm.nih.gov/research/umls/rxnorm';

const END = new Date('2026-04-01T09:00:00Z');
const months = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(END);
    d.setUTCMonth(d.getUTCMonth() - i);
    dates.push(d.toISOString());
  }
  return dates;
};

const ref = (patientId) => ({ reference: `Patient/${patientId}` });

const bpPanel = (id, patientId, date, systolic, diastolic) => ({
  resourceType: 'Observation',
  id,
  status: 'final',
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs',
        },
      ],
    },
  ],
  code: {
    coding: [{ system: LOINC, code: '85354-9', display: 'Blood pressure panel' }],
    text: 'Blood pressure',
  },
  subject: ref(patientId),
  effectiveDateTime: date,
  component: [
    {
      code: {
        coding: [{ system: LOINC, code: '8480-6', display: 'Systolic blood pressure' }],
      },
      valueQuantity: { value: systolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
    },
    {
      code: {
        coding: [{ system: LOINC, code: '8462-4', display: 'Diastolic blood pressure' }],
      },
      valueQuantity: { value: diastolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
    },
  ],
});

const quantityObs = (id, patientId, date, loinc, display, value, unit, ucum) => ({
  resourceType: 'Observation',
  id,
  status: 'final',
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory',
        },
      ],
    },
  ],
  code: { coding: [{ system: LOINC, code: loinc, display }], text: display },
  subject: ref(patientId),
  effectiveDateTime: date,
  valueQuantity: { value, unit, system: 'http://unitsofmeasure.org', code: ucum },
});

const adherenceObs = (id, patientId, date, level) => ({
  resourceType: 'Observation',
  id,
  status: 'final',
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'survey',
          display: 'Survey',
        },
      ],
    },
  ],
  code: {
    coding: [{ system: LOINC, code: '71799-1', display: 'Adherence to medication regimen' }],
    text: 'Patient-reported medication adherence',
  },
  subject: ref(patientId),
  effectiveDateTime: date,
  valueCodeableConcept: { text: level, coding: [{ system: 'urn:local:adherence', code: level.toLowerCase(), display: level }] },
});

const condition = (id, patientId, icd10, snomed, display, onsetDate) => ({
  resourceType: 'Condition',
  id,
  clinicalStatus: {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
  },
  verificationStatus: {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
  },
  code: {
    coding: [
      { system: ICD10, code: icd10, display },
      { system: SNOMED, code: snomed, display },
    ],
    text: display,
  },
  subject: ref(patientId),
  onsetDateTime: onsetDate,
});

const medRequest = (id, patientId, rxnorm, display, dose, unit, frequency, startDate) => ({
  resourceType: 'MedicationRequest',
  id,
  status: 'active',
  intent: 'order',
  medicationCodeableConcept: {
    coding: [{ system: RXNORM, code: rxnorm, display }],
    text: display,
  },
  subject: ref(patientId),
  authoredOn: startDate,
  dosageInstruction: [
    {
      text: `${display} ${dose} ${unit} ${frequency}`,
      timing: { code: { text: frequency } },
      doseAndRate: [
        {
          doseQuantity: { value: dose, unit, system: 'http://unitsofmeasure.org', code: 'mg' },
        },
      ],
    },
  ],
});

const encounter = (id, patientId, classCode, typeDisplay, reasonText, start, end) => ({
  resourceType: 'Encounter',
  id,
  status: 'finished',
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    code: classCode,
    display: classCode === 'AMB' ? 'Ambulatory' : classCode === 'EMER' ? 'Emergency' : classCode,
  },
  type: [{ text: typeDisplay }],
  subject: ref(patientId),
  period: { start, end },
  reasonCode: [{ text: reasonText }],
  participant: [{ individual: { display: 'Dr. A. Singh' } }],
});

const allergy = (id, patientId, substance, reaction, criticality, onsetDate) => ({
  resourceType: 'AllergyIntolerance',
  id,
  clinicalStatus: {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }],
  },
  verificationStatus: {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }],
  },
  category: ['medication'],
  criticality,
  code: { text: substance },
  patient: ref(patientId),
  onsetDateTime: onsetDate,
  reaction: [{ manifestation: [{ text: reaction }] }],
});

const bundleOf = (resources) => ({
  resourceType: 'Bundle',
  type: 'collection',
  entry: resources.map((resource) => ({ resource })),
});

// ---- Series generators ----

const seriesBP = (patientId, dates, systolicSeries, diastolicSeries) =>
  dates.map((date, i) => bpPanel(`${patientId}-bp-${i}`, patientId, date, systolicSeries[i], diastolicSeries[i]));

const seriesK = (patientId, dates, values) =>
  dates.map((date, i) => quantityObs(`${patientId}-k-${i}`, patientId, date, '77142-8', 'Potassium [Moles/volume] in Serum, Plasma or Blood', values[i], 'mmol/L', 'mmol/L'));

const seriesEGFR = (patientId, dates, values) =>
  dates.map((date, i) => quantityObs(`${patientId}-egfr-${i}`, patientId, date, '33914-3', 'eGFR (CKD-EPI)', values[i], 'mL/min/1.73m2', 'mL/min/{1.73_m2}'));

const seriesAdherence = (patientId, dates, levels) =>
  dates.map((date, i) => adherenceObs(`${patientId}-adh-${i}`, patientId, date, levels[i]));

// ---- Per-patient data ----

const bpMonths = months(15);
const labMonths = months(12).filter((_, i) => i % 2 === 0); // every 2 months, 6 points
const adhMonths = months(12);

// Patient 001 — Maria Gonzalez, 58F, uncontrolled BP, CKD stage 3, T2DM, ACEi allergy
const p1 = (() => {
  const id = 'patient-001';
  const systolic = [168, 162, 170, 158, 152, 148, 156, 160, 154, 150, 146, 152, 158, 154, 149];
  const diastolic = [98, 94, 96, 92, 88, 86, 90, 94, 90, 88, 84, 88, 92, 90, 86];
  const k = [4.8, 5.0, 5.2, 4.9, 5.1, 5.3];
  const egfr = [48, 46, 44, 45, 43, 42];
  const adherence = ['Medium', 'Low', 'Low', 'Medium', 'Medium', 'Low', 'Medium', 'Low', 'Medium', 'Medium', 'Low', 'Medium'];
  return bundleOf([
    patients.find((p) => p.id === id),
    condition('c1-1', id, 'I10', '59621000', 'Essential (primary) hypertension', '2018-05-10'),
    condition('c1-2', id, 'N18.3', '433144002', 'Chronic kidney disease, stage 3', '2022-02-14'),
    condition('c1-3', id, 'E11.9', '44054006', 'Type 2 diabetes mellitus', '2019-09-01'),
    medRequest('m1-1', id, '52175', 'Losartan', 100, 'mg', 'once daily', '2023-03-01'),
    medRequest('m1-2', id, '17767', 'Amlodipine', 10, 'mg', 'once daily', '2023-03-01'),
    medRequest('m1-3', id, '2409', 'Chlorthalidone', 25, 'mg', 'once daily', '2024-06-15'),
    allergy('a1-1', id, 'Lisinopril', 'Angioedema', 'high', '2020-07-03'),
    encounter('e1-1', id, 'AMB', 'Nephrology follow-up', 'CKD monitoring', '2026-03-18T14:00:00Z', '2026-03-18T14:30:00Z'),
    encounter('e1-2', id, 'AMB', 'Primary care visit', 'Hypertension follow-up', '2026-01-22T10:00:00Z', '2026-01-22T10:25:00Z'),
    encounter('e1-3', id, 'EMER', 'Emergency department', 'Hypertensive urgency, SBP 198', '2025-11-05T22:10:00Z', '2025-11-06T02:00:00Z'),
    encounter('e1-4', id, 'AMB', 'Primary care visit', 'Medication titration', '2025-08-12T09:15:00Z', '2025-08-12T09:40:00Z'),
    ...seriesBP(id, bpMonths, systolic, diastolic),
    ...seriesK(id, labMonths, k),
    ...seriesEGFR(id, labMonths, egfr),
    ...seriesAdherence(id, adhMonths, adherence),
  ]);
})();

// Patient 002 — James Patterson, 46M, well-controlled on monotherapy
const p2 = (() => {
  const id = 'patient-002';
  const systolic = [138, 132, 128, 126, 124, 122, 125, 128, 124, 122, 120, 124, 126, 122, 121];
  const diastolic = [88, 84, 80, 78, 76, 74, 76, 78, 76, 74, 72, 74, 76, 74, 73];
  const k = [4.1, 4.2, 4.0, 4.2, 4.3, 4.1];
  const egfr = [92, 95, 93, 94, 96, 95];
  const adherence = ['Medium', 'High', 'High', 'High', 'Medium', 'High', 'High', 'High', 'High', 'High', 'High', 'High'];
  return bundleOf([
    patients.find((p) => p.id === id),
    condition('c2-1', id, 'I10', '59621000', 'Essential (primary) hypertension', '2024-10-05'),
    medRequest('m2-1', id, '29046', 'Lisinopril', 20, 'mg', 'once daily', '2024-10-10'),
    encounter('e2-1', id, 'AMB', 'Primary care visit', 'Hypertension follow-up', '2026-02-11T11:00:00Z', '2026-02-11T11:20:00Z'),
    encounter('e2-2', id, 'AMB', 'Primary care visit', 'Annual physical', '2025-09-02T08:30:00Z', '2025-09-02T09:15:00Z'),
    encounter('e2-3', id, 'AMB', 'Primary care visit', 'New hypertension diagnosis', '2024-10-05T14:00:00Z', '2024-10-05T14:40:00Z'),
    ...seriesBP(id, bpMonths, systolic, diastolic),
    ...seriesK(id, labMonths, k),
    ...seriesEGFR(id, labMonths, egfr),
    ...seriesAdherence(id, adhMonths, adherence),
  ]);
})();

// Patient 003 — Robert Chen, 67M, CAD, moderately controlled on 3-drug regimen
const p3 = (() => {
  const id = 'patient-003';
  const systolic = [145, 142, 140, 138, 136, 134, 132, 134, 132, 130, 132, 131, 130, 128, 129];
  const diastolic = [88, 86, 84, 82, 82, 80, 80, 80, 78, 78, 78, 78, 76, 76, 76];
  const k = [4.4, 4.5, 4.3, 4.4, 4.2, 4.3];
  const egfr = [72, 70, 71, 70, 68, 69];
  const adherence = ['High', 'High', 'Medium', 'High', 'High', 'High', 'High', 'Medium', 'High', 'High', 'High', 'High'];
  return bundleOf([
    patients.find((p) => p.id === id),
    condition('c3-1', id, 'I10', '59621000', 'Essential (primary) hypertension', '2012-04-18'),
    condition('c3-2', id, 'I25.10', '53741008', 'Coronary artery disease', '2019-11-22'),
    medRequest('m3-1', id, '29046', 'Lisinopril', 40, 'mg', 'once daily', '2022-01-14'),
    medRequest('m3-2', id, '17767', 'Amlodipine', 5, 'mg', 'once daily', '2022-01-14'),
    medRequest('m3-3', id, '5487', 'Hydrochlorothiazide', 25, 'mg', 'once daily', '2023-06-01'),
    encounter('e3-1', id, 'AMB', 'Cardiology follow-up', 'CAD + HTN management', '2026-03-04T13:30:00Z', '2026-03-04T14:00:00Z'),
    encounter('e3-2', id, 'AMB', 'Primary care visit', 'Hypertension follow-up', '2025-12-10T10:00:00Z', '2025-12-10T10:25:00Z'),
    encounter('e3-3', id, 'AMB', 'Primary care visit', 'Medication review', '2025-06-18T09:30:00Z', '2025-06-18T09:55:00Z'),
    ...seriesBP(id, bpMonths, systolic, diastolic),
    ...seriesK(id, labMonths, k),
    ...seriesEGFR(id, labMonths, egfr),
    ...seriesAdherence(id, adhMonths, adherence),
  ]);
})();

const out = [
  ['patient-001.json', p1],
  ['patient-002.json', p2],
  ['patient-003.json', p3],
];

for (const [filename, bundle] of out) {
  writeFileSync(path.join(FIX, 'bundles', filename), JSON.stringify(bundle, null, 2));
  console.log(`wrote ${filename} (${bundle.entry.length} entries)`);
}
