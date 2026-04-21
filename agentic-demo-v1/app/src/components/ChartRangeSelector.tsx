import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { RangeKey } from '../utils/fhir';

interface Props {
  value: RangeKey;
  onChange: (value: RangeKey) => void;
}

export default function ChartRangeSelector({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next) => next && onChange(next)}
    >
      <ToggleButton value="3m">3m</ToggleButton>
      <ToggleButton value="6m">6m</ToggleButton>
      <ToggleButton value="1y">1y</ToggleButton>
      <ToggleButton value="all">All</ToggleButton>
    </ToggleButtonGroup>
  );
}
