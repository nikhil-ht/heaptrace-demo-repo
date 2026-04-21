import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import WidgetCard from './WidgetCard';

interface Props {
  medications: any[];
}

const rawName = (m: any): string =>
  m?.medicationCodeableConcept?.text ??
  m?.medicationCodeableConcept?.coding?.[0]?.display ??
  'Medication';

// Strip "50 MG Oral Tablet" etc. for a cleaner name column
const displayName = (m: any) => {
  const name = rawName(m);
  return name
    .replace(/\b\d+(\.\d+)?\s*(MG|MCG|ML|G|UNIT|IU)\b.*/i, '')
    .replace(/\b(Oral\s+Tablet|Tablet|Capsule|Extended\s+Release\s+Oral\s+Tablet|Injection|Solution)\b.*/i, '')
    .trim() || name;
};

const dose = (m: any) => {
  const d = m?.dosageInstruction?.[0];
  const qty = d?.doseAndRate?.[0]?.doseQuantity;
  if (qty?.value) return `${qty.value} ${qty.unit ?? 'mg'}`;
  // Fallback: parse dose out of the medication name ("sertraline 50 MG Oral Tablet")
  const match = rawName(m).match(/(\d+(?:\.\d+)?)\s*(MG|MCG|ML|G|UNIT|IU)/i);
  return match ? `${match[1]} ${match[2].toLowerCase()}` : '—';
};

const frequency = (m: any) => {
  const d = m?.dosageInstruction?.[0];
  return d?.timing?.code?.text ?? d?.text ?? '—';
};

// Deduplicate by RxNorm code (or by name), keeping the most recent authoredOn.
const dedupe = (meds: any[]): any[] => {
  const byKey = new Map<string, any>();
  for (const m of meds) {
    const key =
      m?.medicationCodeableConcept?.coding?.[0]?.code ?? rawName(m).toLowerCase();
    const prev = byKey.get(key);
    if (!prev || (m.authoredOn ?? '') > (prev.authoredOn ?? '')) {
      byKey.set(key, m);
    }
  }
  return [...byKey.values()].sort((a, b) =>
    (b.authoredOn ?? '').localeCompare(a.authoredOn ?? ''),
  );
};

export default function CurrentMedicationsWidget({ medications }: Props) {
  const rows = dedupe(medications);
  return (
    <WidgetCard title="Current Medications">
      {rows.length === 0 ? (
        <Typography color="text.secondary">No active medications</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medication</TableCell>
              <TableCell>Dose</TableCell>
              <TableCell>Frequency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{displayName(m)}</TableCell>
                <TableCell>{dose(m)}</TableCell>
                <TableCell>{frequency(m)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </WidgetCard>
  );
}
