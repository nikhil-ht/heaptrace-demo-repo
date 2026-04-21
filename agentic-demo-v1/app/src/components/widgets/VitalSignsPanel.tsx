import { Box, Grid, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AirIcon from '@mui/icons-material/Air';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import StraightenIcon from '@mui/icons-material/Straighten';
import { format, parseISO } from 'date-fns';
import WidgetCard from './WidgetCard';
import { getObservationValue } from '../../utils/fhir';

interface Props {
  hr: any[];
  rr: any[];
  o2: any[];
  temp: any[];
  weight: any[];
  bmi: any[];
}

const latest = (obs: any[]) => {
  if (!obs?.length) return undefined;
  return [...obs].sort((a, b) =>
    (b.effectiveDateTime ?? '').localeCompare(a.effectiveDateTime ?? ''),
  )[0];
};

const fmtValue = (obs?: any, digits = 0) => {
  const v = getObservationValue(obs);
  if (v == null) return '—';
  return digits > 0 ? v.toFixed(digits) : `${v}`;
};

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  date?: string;
}

function Stat({ icon, label, value, unit, date }: StatProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {value}
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            {unit}
          </Typography>
        </Typography>
        {date && (
          <Typography variant="caption" color="text.secondary">
            {format(parseISO(date), 'MMM d, yyyy')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function VitalSignsPanel({ hr, rr, o2, temp, weight, bmi }: Props) {
  const lHr = latest(hr);
  const lRr = latest(rr);
  const lO2 = latest(o2);
  const lTemp = latest(temp);
  const lWeight = latest(weight);
  const lBmi = latest(bmi);
  const anyDate = lHr?.effectiveDateTime ?? lO2?.effectiveDateTime ?? lWeight?.effectiveDateTime;
  return (
    <WidgetCard title="Vital Signs Panel">
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <Stat icon={<FavoriteIcon />} label="Heart rate" value={fmtValue(lHr)} unit="bpm" />
        </Grid>
        <Grid item xs={6}>
          <Stat icon={<AirIcon />} label="Respiratory rate" value={fmtValue(lRr)} unit="/min" />
        </Grid>
        <Grid item xs={6}>
          <Stat icon={<BloodtypeIcon />} label="Oxygen sat" value={fmtValue(lO2)} unit="%" />
        </Grid>
        <Grid item xs={6}>
          <Stat icon={<DeviceThermostatIcon />} label="Temperature" value={fmtValue(lTemp, 1)} unit="°C" />
        </Grid>
        <Grid item xs={6}>
          <Stat icon={<MonitorWeightIcon />} label="Weight" value={fmtValue(lWeight, 1)} unit="kg" />
        </Grid>
        <Grid item xs={6}>
          <Stat icon={<StraightenIcon />} label="BMI" value={fmtValue(lBmi, 1)} unit="kg/m²" />
        </Grid>
      </Grid>
      {anyDate && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Most recent: {format(parseISO(anyDate), 'MMM d, yyyy')}
        </Typography>
      )}
    </WidgetCard>
  );
}
