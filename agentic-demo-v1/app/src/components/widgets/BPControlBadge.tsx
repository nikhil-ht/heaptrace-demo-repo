import { Chip } from '@mui/material';
import { BP_STATUS_META, classifyBP, type BPReading } from '../../utils/fhir';

interface Props {
  latest?: BPReading | null;
  size?: 'small' | 'medium';
}

export default function BPControlBadge({ latest, size = 'medium' }: Props) {
  const status = classifyBP(latest);
  const { label, color } = BP_STATUS_META[status];
  return <Chip label={label} color={color} size={size} />;
}
