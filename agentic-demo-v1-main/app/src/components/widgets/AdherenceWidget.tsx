import { Box, Chip, Stack, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import WidgetCard from './WidgetCard';
import { getObservationText } from '../../utils/fhir';

interface Props {
  observations: any[];
}

const color = (level?: string) =>
  level === 'High' ? 'success' : level === 'Medium' ? 'warning' : level === 'Low' ? 'error' : 'default';

export default function AdherenceWidget({ observations }: Props) {
  const sorted = [...observations].sort((a, b) =>
    (b.effectiveDateTime ?? '').localeCompare(a.effectiveDateTime ?? ''),
  );
  const latest = sorted[0];
  const latestLevel = latest ? getObservationText(latest) : undefined;
  const recent = sorted.slice(0, 6);
  return (
    <WidgetCard title="Patient-Reported Adherence">
      {latest ? (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              {latestLevel}
            </Typography>
            <Chip label={color(latestLevel) as any} color={color(latestLevel) as any} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Reported {format(parseISO(latest.effectiveDateTime), 'MMM d, yyyy')}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            {recent.reverse().map((o) => {
              const level = getObservationText(o);
              return (
                <Chip
                  key={o.id}
                  label={`${format(parseISO(o.effectiveDateTime), 'MMM')} ${level?.[0] ?? '?'}`}
                  size="small"
                  color={color(level) as any}
                  variant="outlined"
                />
              );
            })}
          </Stack>
        </Box>
      ) : (
        <Typography color="text.secondary">No adherence reports</Typography>
      )}
    </WidgetCard>
  );
}
