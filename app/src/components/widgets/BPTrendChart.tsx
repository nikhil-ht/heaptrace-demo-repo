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
import { alpha, useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
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
  const axisColor = theme.palette.text.secondary;
  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
  };

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
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.8)} />
          <XAxis dataKey="label" stroke={axisColor} tick={{ fill: axisColor }} />
          <YAxis domain={[60, 200]} stroke={axisColor} tick={{ fill: axisColor }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: axisColor }} />
          <ReferenceLine
            y={130}
            stroke={theme.palette.warning.main}
            strokeDasharray="4 4"
            label={{ value: 'Target SBP 130', fill: axisColor }}
          />
          <ReferenceLine
            y={80}
            stroke={theme.palette.info.main}
            strokeDasharray="4 4"
            label={{ value: 'Target DBP 80', fill: axisColor }}
          />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke={theme.palette.error.main}
            dot={{ r: 3 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke={theme.palette.primary.main}
            dot={{ r: 3 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
