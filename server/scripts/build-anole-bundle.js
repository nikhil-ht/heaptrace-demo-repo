// Builds an FHIR Bundle for Anole Persimmon by merging the real fixture files
// under src/fixtures/data/ with generated 12-month supplementary observations
// (BP, HR, RR, O2, Temp, Weight, BMI, eGFR, adherence).
//
// Run: node scripts/build-anole-bundle.js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'src', 'fixtures', 'data');
const OUT = path.join(__dirname, '..', 'src', 'fixtures', 'bundles');
mkdirSync(OUT, { recursive: true });

const loadJSON = (f) => JSON.parse(readFileSync(path.join(DATA, f), 'utf8'));

const patient = loadJSON('Patient.txt');
const practitioner = loadJSON('Practitioner.txt');
const bundleEntries = (b) => (b.entry ?? []).map((e) => e.resource);
const conditions = bundleEntries(loadJSON('Condition.txt'));
const encounters = bundleEntries(loadJSON('Encounter.txt'));
const medications = bundleEntries(loadJSON('MedicationRequest.txt'));
const observations = bundleEntries(loadJSON('Observation.txt'));
const vitals = bundleEntries(loadJSON('vital-signs.txt'));

const NEW_PATIENT_ID = 'patient-persimmon';
const OLD_PATIENT_REF = `Patient/${patient.id}`;
const NEW_PATIENT_REF = `Patient/${NEW_PATIENT_ID}`;
patient.id = NEW_PATIENT_ID;
const PATIENT_ID = NEW_PATIENT_ID;
const SUBJECT = { reference: NEW_PATIENT_REF };

// Rewrite references on all incoming resources so everything points to the new id.
const rewriteRefs = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const x of obj) rewriteRefs(x);
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'reference' && typeof v === 'string' && v === OLD_PATIENT_REF) {
      obj[k] = NEW_PATIENT_REF;
    } else {
      rewriteRefs(v);
    }
  }
};
const LOINC = 'http://loinc.org';
const CATEGORY_LAB = [
  { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory', display: 'laboratory' }], text: 'laboratory' },
];
const CATEGORY_VITAL = [
  { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'vital-signs' }], text: 'vital-signs' },
];
const CATEGORY_SURVEY = [
  { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'survey' }], text: 'survey' },
];

// Collect dates already present per observation kind so we don't double-stamp a month.
const monthKey = (iso) => iso?.slice(0, 7);
const existingByCode = (code) =>
  new Set(
    [...vitals, ...observations]
      .filter((o) => o?.code?.coding?.some((c) => c.code === code))
      .map((o) => monthKey(o.effectiveDateTime))
      .filter(Boolean),
  );

// ---- Supplementary 12-month series (back-fill months not already present) ----

const today = new Date('2026-04-01T09:00:00.000Z');
const monthsBack = (n) => {
  const arr = [];
  for (let i = n; i >= 1; i--) {
    const d = new Date(today);
    d.setUTCMonth(d.getUTCMonth() - i);
    d.setUTCDate(15);
    arr.push(d.toISOString().replace('Z', '+00:00'));
  }
  return arr;
};

const supplementMonths = monthsBack(12); // 12 backfill points

const quantity = (value, unit, ucum = unit) => ({
  value,
  unit,
  system: 'http://unitsofmeasure.org',
  code: ucum,
});

const makeObs = ({ code, display, value, unit, ucum, date, category, extraCodes = [] }) => ({
  resourceType: 'Observation',
  id: randomUUID(),
  status: 'final',
  category,
  code: {
    coding: [{ system: LOINC, code, display }, ...extraCodes],
    text: display,
  },
  subject: SUBJECT,
  effectiveDateTime: date,
  issued: date,
  valueQuantity: quantity(value, unit, ucum),
});

const makeBP = ({ systolic, diastolic, date }) => ({
  resourceType: 'Observation',
  id: randomUUID(),
  status: 'final',
  category: CATEGORY_VITAL,
  code: {
    coding: [{ system: LOINC, code: '85354-9', display: 'Blood Pressure' }],
    text: 'Blood Pressure',
  },
  subject: SUBJECT,
  effectiveDateTime: date,
  issued: date,
  component: [
    {
      code: { coding: [{ system: LOINC, code: '8480-6', display: 'Systolic Blood Pressure' }], text: 'Systolic Blood Pressure' },
      valueQuantity: quantity(systolic, 'mm[Hg]', 'mm[Hg]'),
    },
    {
      code: { coding: [{ system: LOINC, code: '8462-4', display: 'Diastolic Blood Pressure' }], text: 'Diastolic Blood Pressure' },
      valueQuantity: quantity(diastolic, 'mm[Hg]', 'mm[Hg]'),
    },
  ],
});

const makeAdherence = ({ level, date }) => ({
  resourceType: 'Observation',
  id: randomUUID(),
  status: 'final',
  category: CATEGORY_SURVEY,
  code: {
    coding: [{ system: LOINC, code: '71799-1', display: 'Adherence to medication regimen' }],
    text: 'Patient-reported medication adherence',
  },
  subject: SUBJECT,
  effectiveDateTime: date,
  issued: date,
  valueCodeableConcept: {
    text: level,
    coding: [{ system: 'urn:local:adherence', code: level.toLowerCase(), display: level }],
  },
});

const fillSeries = (existingMonths, series) =>
  supplementMonths
    .filter((date) => !existingMonths.has(monthKey(date)))
    .map((date, i) => ({ date, value: series[i % series.length] }));

// Patterns — elevated/uncontrolled BP trending down slightly; CKD eGFR 45–55; normal K+; mostly Medium adherence
const bpSeries = [
  { s: 168, d: 98 },
  { s: 164, d: 96 },
  { s: 158, d: 94 },
  { s: 162, d: 94 },
  { s: 156, d: 92 },
  { s: 150, d: 90 },
  { s: 154, d: 92 },
  { s: 148, d: 88 },
  { s: 146, d: 88 },
  { s: 152, d: 90 },
  { s: 144, d: 86 },
  { s: 148, d: 88 },
];
const egfrSeries = [52, 51, 54, 50, 49, 52, 48, 47, 50, 49, 46, 48];
const adherenceLevels = ['Medium', 'Low', 'Medium', 'Medium', 'High', 'Medium', 'Medium', 'Low', 'Medium', 'Medium', 'High', 'Medium'];
const hrSeries = [58, 62, 60, 64, 66, 62, 60, 58, 62, 60, 64, 62];
const rrSeries = [18, 18, 20, 19, 18, 18, 20, 18, 20, 19, 18, 20];
const o2Series = [97, 98, 96, 97, 95, 97, 98, 96, 94, 97, 96, 98];
const tempSeries = [36.6, 36.5, 36.7, 36.6, 36.4, 36.5, 36.6, 36.5, 36.7, 36.5, 36.6, 36.4];
const weightSeries = [102, 101.5, 101, 100.5, 100, 100, 99.5, 99.5, 99, 99, 98.5, 98.5];
const heightCm = 178;
const bmiFor = (w) => +(w / Math.pow(heightCm / 100, 2)).toFixed(1);

const bpExisting = existingByCode('85354-9');
const kExisting = existingByCode('77142-8');
const hrExisting = existingByCode('8867-4');
const rrExisting = existingByCode('9279-1');
const o2Existing = existingByCode('2708-6');
const tempExisting = existingByCode('8310-5');
const weightExisting = existingByCode('29463-7');
const bmiExisting = existingByCode('39156-5');
const heightExisting = existingByCode('8302-2');

const supplementaryBP = supplementMonths
  .filter((d) => !bpExisting.has(monthKey(d)))
  .map((d, i) => makeBP({ date: d, systolic: bpSeries[i % bpSeries.length].s, diastolic: bpSeries[i % bpSeries.length].d }));

const makeLab = (code, display, unit, ucum, date, value) =>
  makeObs({ code, display, value, unit, ucum, date, category: CATEGORY_LAB });

const makeVital = (code, display, unit, ucum, date, value) =>
  makeObs({ code, display, value, unit, ucum, date, category: CATEGORY_VITAL });

const supplementaryK = supplementMonths
  .filter((d) => !kExisting.has(monthKey(d)))
  .slice(0, 6) // denser than existing 5, but not every month
  .filter((_, i) => i % 2 === 0)
  .map((d, i) => makeLab('77142-8', 'Potassium [Moles/volume] in Serum, Plasma or Blood', 'mmol/L', 'mmol/L', d, [4.1, 4.4, 4.5, 4.3, 4.2, 4.6][i % 6]));

const supplementaryEGFR = supplementMonths.map((d, i) =>
  makeLab('33914-3', 'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (MDRD)', 'mL/min/1.73m2', 'mL/min/{1.73_m2}', d, egfrSeries[i]),
);

const supplementaryHR = supplementMonths
  .filter((d) => !hrExisting.has(monthKey(d)))
  .map((d, i) => makeVital('8867-4', 'Heart rate', '/min', '/min', d, hrSeries[i % hrSeries.length]));

const supplementaryRR = supplementMonths
  .filter((d) => !rrExisting.has(monthKey(d)))
  .map((d, i) => makeVital('9279-1', 'Respiratory rate', '/min', '/min', d, rrSeries[i % rrSeries.length]));

const supplementaryO2 = supplementMonths
  .filter((d) => !o2Existing.has(monthKey(d)))
  .map((d, i) => makeVital('2708-6', 'Oxygen saturation in Arterial blood', '%', '%', d, o2Series[i % o2Series.length]));

const supplementaryTemp = supplementMonths
  .filter((d) => !tempExisting.has(monthKey(d)))
  .map((d, i) => makeVital('8310-5', 'Body temperature', 'Cel', 'Cel', d, tempSeries[i % tempSeries.length]));

const supplementaryWeight = supplementMonths
  .filter((d) => !weightExisting.has(monthKey(d)))
  .map((d, i) => makeVital('29463-7', 'Body Weight', 'kg', 'kg', d, weightSeries[i % weightSeries.length]));

const supplementaryBMI = supplementMonths
  .filter((d) => !bmiExisting.has(monthKey(d)))
  .map((d, i) => makeVital('39156-5', 'Body Mass Index', 'kg/m2', 'kg/m2', d, bmiFor(weightSeries[i % weightSeries.length])));

const supplementaryHeight = supplementMonths
  .filter((d) => !heightExisting.has(monthKey(d)))
  .slice(0, 1) // height is stable
  .map((d) => makeVital('8302-2', 'Body Height', 'cm', 'cm', d, heightCm));

const adherenceObs = supplementMonths.map((d, i) => makeAdherence({ date: d, level: adherenceLevels[i] }));

// ---- Allergies (no AllergyIntolerance in the source data/ folder) ----
const makeAllergy = ({ substance, reaction, criticality, onsetDate, rxcui }) => ({
  resourceType: 'AllergyIntolerance',
  id: randomUUID(),
  clinicalStatus: {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active', display: 'Active' }],
  },
  verificationStatus: {
    coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed', display: 'Confirmed' }],
  },
  category: ['medication'],
  criticality,
  code: {
    coding: rxcui
      ? [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: rxcui, display: substance }]
      : [],
    text: substance,
  },
  patient: SUBJECT,
  onsetDateTime: onsetDate,
  recordedDate: onsetDate,
  reaction: [
    {
      manifestation: [{ text: reaction }],
      severity: criticality === 'high' ? 'severe' : 'moderate',
    },
  ],
});

const allergies = [
  // NSAIDs — critical for a CKD + HTN patient (worsens both)
  makeAllergy({
    substance: 'Ibuprofen (NSAIDs)',
    reaction: 'Worsening renal function, peripheral edema',
    criticality: 'high',
    onsetDate: '2023-05-14',
    rxcui: '5640',
  }),
  // Lisinopril — relevant to why she's on Valsartan instead
  makeAllergy({
    substance: 'Lisinopril',
    reaction: 'Persistent dry cough',
    criticality: 'low',
    onsetDate: '2022-09-02',
    rxcui: '29046',
  }),
  // Penicillin — very common, documented allergen
  makeAllergy({
    substance: 'Penicillin',
    reaction: 'Urticaria (hives)',
    criticality: 'high',
    onsetDate: '2010-03-20',
    rxcui: '7980',
  }),
  // Sulfa — common and relevant to diuretics (furosemide is sulfa-derived)
  makeAllergy({
    substance: 'Sulfa antibiotics',
    reaction: 'Maculopapular rash',
    criticality: 'low',
    onsetDate: '2018-08-12',
  }),
];

// Adjust encounter periods so durations are realistic and timeline reads well.
// Ambulatory visits get 25–40 min, labs get ~15 min, inpatient 3–4 days, ED 3 h.
const hour = (h, m = 0) => {
  const d = new Date();
  d.setUTCHours(h, m, 0, 0);
  return { h: d.getUTCHours(), m: d.getUTCMinutes() };
};
const visitStyle = (e) => {
  const typeText = (e.type?.[0]?.text ?? '').toLowerCase();
  const cls = e.class?.code;
  if (cls === 'EMER') return { hour: 22, durationMin: 180 };
  if (cls === 'IMP') return { hour: 14, durationMin: 60 * 24 * 3 }; // 3 days
  if (typeText.includes('lab')) return { hour: 8, durationMin: 20 };
  if (typeText.includes('follow')) return { hour: 10, durationMin: 30 };
  if (typeText.includes('office')) return { hour: 15, durationMin: 40 };
  return { hour: 11, durationMin: 30 };
};
// Vary the hour slightly per encounter so same-type visits aren't stacked identically
const varyHour = (baseHour, i) => (baseHour + (i % 3)) % 24;

// Map encounter type text to a clinically meaningful reasonCode for this patient
// (hypertension + hypertensive CKD + hypertensive heart disease).
const reasonFor = (e) => {
  const t = (e.type?.[0]?.text ?? '').toLowerCase();
  if (t.includes('shortness')) {
    return { text: 'Acute decompensated heart failure', icd10: 'I50.23', display: 'Acute on chronic systolic heart failure' };
  }
  if (t.includes('laceration') || t.includes('hand')) {
    return { text: 'Open wound of hand requiring sutures', icd10: 'S61.419A' };
  }
  if (t.includes('pneumonia')) {
    return { text: 'Community-acquired pneumonia', icd10: 'J18.9' };
  }
  if (t.includes('lab')) {
    return { text: 'Routine monitoring (BMP, renal panel) for CKD & antihypertensive therapy', icd10: 'Z00.00' };
  }
  if (t.includes('follow')) {
    return { text: 'Hypertension & CKD follow-up, medication titration', icd10: 'I10' };
  }
  if (t.includes('office')) {
    return { text: 'Essential hypertension management', icd10: 'I10' };
  }
  return { text: 'Primary care visit', icd10: 'Z00.00' };
};

for (let i = 0; i < encounters.length; i++) {
  const e = encounters[i];
  if (!e.period?.start) continue;
  const style = visitStyle(e);
  const day = new Date(e.period.start);
  day.setUTCHours(varyHour(style.hour, i), (i * 7) % 60, 0, 0);
  const start = new Date(day);
  const end = new Date(start.getTime() + style.durationMin * 60 * 1000);
  e.period.start = start.toISOString();
  e.period.end = end.toISOString();

  // Populate reasonCode if empty
  if (!e.reasonCode || e.reasonCode.length === 0 || !e.reasonCode[0]?.text) {
    const r = reasonFor(e);
    e.reasonCode = [
      {
        coding: r.icd10
          ? [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: r.icd10, display: r.display ?? r.text }]
          : [],
        text: r.text,
      },
    ];
  }
}

// ---- Assemble bundle ----
for (const r of [...conditions, ...encounters, ...medications, ...observations, ...vitals]) {
  rewriteRefs(r);
}
const allResources = [
  patient,
  practitioner,
  ...conditions,
  ...encounters,
  ...medications,
  ...observations, // existing K+ readings
  ...vitals, // existing BP + vitals
  ...supplementaryBP,
  ...supplementaryK,
  ...supplementaryEGFR,
  ...supplementaryHR,
  ...supplementaryRR,
  ...supplementaryO2,
  ...supplementaryTemp,
  ...supplementaryWeight,
  ...supplementaryBMI,
  ...supplementaryHeight,
  ...adherenceObs,
  ...allergies,
];

const bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: allResources.map((resource) => ({ resource })),
};

const outFile = path.join(OUT, `${PATIENT_ID}.json`);
writeFileSync(outFile, JSON.stringify(bundle, null, 2));

// Summary
const counts = {};
for (const r of allResources) counts[r.resourceType] = (counts[r.resourceType] ?? 0) + 1;
console.log('wrote', outFile);
console.log('total entries:', allResources.length);
console.log('by resource:', counts);
console.log('BP readings:', allResources.filter((r) => r.resourceType === 'Observation' && r.code?.coding?.some((c) => c.code === '85354-9')).length);
console.log('eGFR readings:', allResources.filter((r) => r.resourceType === 'Observation' && r.code?.coding?.some((c) => c.code === '33914-3')).length);
console.log('K+ readings:', allResources.filter((r) => r.resourceType === 'Observation' && r.code?.coding?.some((c) => c.code === '77142-8')).length);
console.log('Adherence:', allResources.filter((r) => r.resourceType === 'Observation' && r.code?.coding?.some((c) => c.code === '71799-1')).length);
console.log('Weight:', allResources.filter((r) => r.resourceType === 'Observation' && r.code?.coding?.some((c) => c.code === '29463-7')).length);
