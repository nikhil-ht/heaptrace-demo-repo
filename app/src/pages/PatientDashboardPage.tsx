import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Grid, CircularProgress, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  usePatient,
  useObservations,
  useConditions,
  useMedications,
  useEncounters,
  useAllergies,
} from '../hooks/useFhir';
import {
  getObservationValue,
  parseBPPanel,
  sortByDateAsc,
  type RangeKey,
} from '../utils/fhir';
import PatientHeader from '../components/widgets/PatientHeader';
import VitalsWidget from '../components/widgets/VitalsWidget';
import CurrentMedicationsWidget from '../components/widgets/CurrentMedicationsWidget';
import ConditionsWidget from '../components/widgets/ConditionsWidget';
import AllergiesWidget from '../components/widgets/AllergiesWidget';
import AdherenceWidget from '../components/widgets/AdherenceWidget';
import EncountersWidget from '../components/widgets/EncountersWidget';
import EncountersTimeline from '../components/widgets/EncountersTimeline';
import BPTrendChart from '../components/widgets/BPTrendChart';
import LabTrendChart from '../components/widgets/LabTrendChart';
import VitalSignsPanel from '../components/widgets/VitalSignsPanel';

export default function PatientDashboardPage() {
  const theme = useTheme();
  const { id = '' } = useParams();
  const [range, setRange] = useState<RangeKey>('1y');

  const patient = usePatient(id);
  const bp = useObservations(id, '85354-9');
  const k = useObservations(id, '77142-8');
  const egfr = useObservations(id, '33914-3');
  const adherence = useObservations(id, '71799-1');
  const hr = useObservations(id, '8867-4');
  const rr = useObservations(id, '9279-1');
  const o2 = useObservations(id, '2708-6');
  const temp = useObservations(id, '8310-5');
  const weight = useObservations(id, '29463-7');
  const bmi = useObservations(id, '39156-5');
  const conditions = useConditions(id);
  const medications = useMedications(id);
  const encounters = useEncounters(id);
  const allergies = useAllergies(id);

  if (patient.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (patient.error || !patient.data) {
    return <Typography color="error">Patient not found</Typography>;
  }

  const bpReadings = sortByDateAsc(
    (bp.data ?? [])
      .map(parseBPPanel)
      .filter((r): r is NonNullable<typeof r> => r != null),
  );
  const kPoints = (k.data ?? [])
    .map((o: any) => ({ date: o.effectiveDateTime, value: getObservationValue(o) ?? NaN }))
    .filter((p) => !Number.isNaN(p.value));
  const egfrPoints = (egfr.data ?? [])
    .map((o: any) => ({ date: o.effectiveDateTime, value: getObservationValue(o) ?? NaN }))
    .filter((p) => !Number.isNaN(p.value));
  const weightPoints = (weight.data ?? [])
    .map((o: any) => ({ date: o.effectiveDateTime, value: getObservationValue(o) ?? NaN }))
    .filter((p) => !Number.isNaN(p.value));

  return (
    <Box>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 1 }}
        size="small"
      >
        All patients
      </Button>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <PatientHeader patient={patient.data} />
        </Grid>
        <Grid item xs={12} md={4}>
          <VitalsWidget readings={bpReadings} />
        </Grid>

        <Grid item xs={12} md={6}>
          <CurrentMedicationsWidget medications={medications.data ?? []} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ConditionsWidget conditions={conditions.data ?? []} />
        </Grid>

        <Grid item xs={12} md={4}>
          <AllergiesWidget allergies={allergies.data ?? []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <AdherenceWidget observations={adherence.data ?? []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <VitalSignsPanel
            hr={hr.data ?? []}
            rr={rr.data ?? []}
            o2={o2.data ?? []}
            temp={temp.data ?? []}
            weight={weight.data ?? []}
            bmi={bmi.data ?? []}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <EncountersTimeline encounters={encounters.data ?? []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <EncountersWidget encounters={encounters.data ?? []} />
        </Grid>

        <Grid item xs={12}>
          <BPTrendChart readings={bpReadings} range={range} onRangeChange={setRange} />
        </Grid>

        <Grid item xs={12} md={6}>
          <LabTrendChart
            title="Serum Potassium (K⁺)"
            unit="mmol/L"
            points={kPoints}
            range={range}
            onRangeChange={setRange}
            color={theme.palette.mode === 'dark' ? '#ab47bc' : '#6a1b9a'}
            referenceBand={{ low: 3.5, high: 5.0 }}
            yDomain={[3, 6]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabTrendChart
            title="eGFR"
            unit="mL/min/1.73m²"
            points={egfrPoints}
            range={range}
            onRangeChange={setRange}
            color={theme.palette.secondary.main}
            referenceLine={60}
            yDomain={[20, 120]}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <LabTrendChart
            title="Body Weight"
            unit="kg"
            points={weightPoints}
            range={range}
            onRangeChange={setRange}
            color={theme.palette.warning.main}
            yDomain={['auto' as any, 'auto' as any]}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
