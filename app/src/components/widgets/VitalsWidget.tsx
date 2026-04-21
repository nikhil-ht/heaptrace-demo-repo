import { Box, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import WidgetCard from './WidgetCard';
import BPControlBadge from './BPControlBadge';
import type { BPReading } from '../../utils/fhir';

interface Props {
  readings: BPReading[];
}

export default function VitalsWidget({ readings }: Props) {
  const latest = readings.length ? readings[readings.length - 1] : null;
  return (
    <WidgetCard title="Latest Vitals">
      {latest ? (
        <Box>
          <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1 }}>
            {latest.systolic}
            <Typography component="span" variant="h4" color="text.secondary">
              {' / '}
            </Typography>
            {latest.diastolic}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            mmHg · {format(parseISO(latest.date), 'MMM d, yyyy')}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <BPControlBadge latest={latest} size="small" />
          </Box>
        </Box>
      ) : (
        <Typography color="text.secondary">No BP readings</Typography>
      )}
    </WidgetCard>
  );
}
