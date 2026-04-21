import { useMemo } from 'react';
import { Box, Tooltip, Typography, Stack, Chip } from '@mui/material';
import {
  addMonths,
  differenceInMilliseconds,
  eachMonthOfInterval,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';
import WidgetCard from './WidgetCard';

interface Props {
  encounters: any[];
}

const classColor = (code?: string) => {
  switch (code) {
    case 'EMER':
      return '#c62828';
    case 'IMP':
    case 'ACUTE':
      return '#6a1b9a';
    case 'AMB':
      return '#1565c0';
    default:
      return '#455a64';
  }
};

const classLabel = (code?: string) => {
  switch (code) {
    case 'EMER':
      return 'ED';
    case 'IMP':
      return 'Inpatient';
    case 'AMB':
      return 'Ambulatory';
    default:
      return code ?? '—';
  }
};

const ROW_HEIGHT = 36;
const LEFT_COL = 210;

export default function EncountersTimeline({ encounters }: Props) {
  const rows = useMemo(() => {
    return encounters
      .map((e) => {
        const start = e.period?.start ? parseISO(e.period.start) : null;
        const end = e.period?.end ? parseISO(e.period.end) : start;
        return { e, start, end };
      })
      .filter((r) => r.start && r.end) as Array<{ e: any; start: Date; end: Date }>;
  }, [encounters]);

  if (rows.length === 0) {
    return (
      <WidgetCard title="Encounters Timeline">
        <Typography color="text.secondary">No encounters to plot</Typography>
      </WidgetCard>
    );
  }

  const sorted = [...rows].sort((a, b) => a.start.getTime() - b.start.getTime());
  const domainStart = startOfMonth(sorted[0].start);
  const latestEnd = sorted.reduce((acc, r) => (r.end > acc ? r.end : acc), sorted[0].end);
  const domainEnd = addMonths(startOfMonth(latestEnd), 1);
  const totalMs = differenceInMilliseconds(domainEnd, domainStart);
  const months = eachMonthOfInterval({ start: domainStart, end: domainEnd });

  const pct = (date: Date) =>
    (differenceInMilliseconds(date, domainStart) / totalMs) * 100;

  const MIN_BAR_WIDTH = 2; // percent

  return (
    <WidgetCard title="Encounters Timeline">
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Chip size="small" label="Ambulatory" sx={{ bgcolor: classColor('AMB'), color: 'white' }} />
        <Chip size="small" label="ED" sx={{ bgcolor: classColor('EMER'), color: 'white' }} />
        <Chip size="small" label="Inpatient" sx={{ bgcolor: classColor('IMP'), color: 'white' }} />
      </Stack>

      <Box sx={{ display: 'flex' }}>
        <Box sx={{ width: LEFT_COL, flexShrink: 0 }}>
          {/* axis spacer */}
          <Box sx={{ height: 28 }} />
          {sorted.map(({ e }) => (
            <Box
              key={e.id}
              sx={{
                height: ROW_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                pr: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                noWrap
                title={e.type?.[0]?.text}
                sx={{ fontWeight: 500 }}
              >
                {e.type?.[0]?.text ?? 'Encounter'}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ flex: 1, position: 'relative', minWidth: 0 }}>
          {/* month axis */}
          <Box sx={{ position: 'relative', height: 28, borderBottom: '1px solid', borderColor: 'divider' }}>
            {months.map((m) => (
              <Typography
                key={m.toISOString()}
                variant="caption"
                color="text.secondary"
                sx={{
                  position: 'absolute',
                  left: `${pct(m)}%`,
                  transform: 'translateX(-50%)',
                  top: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                {format(m, 'MMM yy')}
              </Typography>
            ))}
          </Box>

          {/* rows */}
          {sorted.map(({ e, start, end }) => {
            const left = pct(start);
            const rawWidth = pct(end) - left;
            const width = Math.max(MIN_BAR_WIDTH, rawWidth);
            const color = classColor(e.class?.code);
            const tooltip = (
              <Box>
                <Typography variant="subtitle2">{e.type?.[0]?.text ?? 'Encounter'}</Typography>
                <Typography variant="caption" display="block">
                  {classLabel(e.class?.code)} · {format(start, 'MMM d, yyyy HH:mm')}
                  {' → '}
                  {format(end, 'MMM d, yyyy HH:mm')}
                </Typography>
                {e.reasonCode?.[0]?.text && (
                  <Typography variant="caption" display="block">
                    Reason: {e.reasonCode[0].text}
                  </Typography>
                )}
              </Box>
            );
            return (
              <Box
                key={e.id}
                sx={{
                  position: 'relative',
                  height: ROW_HEIGHT,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* month gridlines */}
                {months.map((m) => (
                  <Box
                    key={m.toISOString()}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${pct(m)}%`,
                      width: '1px',
                      bgcolor: 'divider',
                      opacity: 0.5,
                    }}
                  />
                ))}
                <Tooltip title={tooltip} arrow placement="top">
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      top: 8,
                      bottom: 8,
                      bgcolor: color,
                      borderRadius: 1,
                      cursor: 'pointer',
                      boxShadow: 1,
                      transition: 'transform 120ms',
                      '&:hover': { transform: 'scaleY(1.1)' },
                      display: 'flex',
                      alignItems: 'center',
                      px: 0.75,
                      overflow: 'hidden',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {format(start, 'MMM d')}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>
    </WidgetCard>
  );
}
