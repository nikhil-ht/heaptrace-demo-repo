import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import WidgetCard from './WidgetCard';
import ChartRangeSelector from '../ChartRangeSelector';
import {
  filterByRange,
  sortByDateAsc,
  type BPReading,
  type RangeKey,
} from '../../utils/fhir';

interface Props {
  readings: BPReading[];
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
}

export default function BPTrendChart({ readings, range, onRangeChange }: Props) {
  const theme = useTheme();
  const data = filterByRange(sortByDateAsc(readings), range).map((r) => ({
    ...r,
    label: format(parseISO(r.date), 'MMM yy'),
  }));
  return (
    <WidgetCard
      title="Blood Pressure Trend"
      action={<ChartRangeSelector value={range} onChange={onRangeChange} />}
      minHeight={320}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={{ stroke: theme.palette.divider }}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis
            domain={[60, 200]}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={{ stroke: theme.palette.divider }}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
            }}
            labelStyle={{ color: theme.palette.text.secondary }}
          />
          <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
          <ReferenceLine y={130} stroke="#f57c00" strokeDasharray="4 4" label="Target SBP 130" />
          <ReferenceLine y={80} stroke="#29b6f6" strokeDasharray="4 4" label="Target DBP 80" />
          <Line type="monotone" dataKey="systolic" stroke="#ef5350" dot={{ r: 3 }} strokeWidth={2} />
          <Line type="monotone" dataKey="diastolic" stroke={theme.palette.primary.main} dot={{ r: 3 }} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
