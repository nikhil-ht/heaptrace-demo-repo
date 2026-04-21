import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import WidgetCard from './WidgetCard';

interface Props {
  encounters: any[];
}

export default function EncountersWidget({ encounters }: Props) {
  const sorted = [...encounters].sort((a, b) =>
    (b.period?.start ?? '').localeCompare(a.period?.start ?? ''),
  );
  return (
    <WidgetCard title="Recent Encounters">
      {sorted.length === 0 ? (
        <Typography color="text.secondary">No encounters</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.slice(0, 8).map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  {e.period?.start
                    ? format(parseISO(e.period.start), 'MMM d, yyyy')
                    : '—'}
                </TableCell>
                <TableCell>{e.type?.[0]?.text ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={e.class?.display ?? e.class?.code ?? '—'}
                    size="small"
                    color={e.class?.code === 'EMER' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>{e.reasonCode?.[0]?.text ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </WidgetCard>
  );
}
