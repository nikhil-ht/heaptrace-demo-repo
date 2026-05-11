import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { alpha, useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import WidgetCard from './WidgetCard';
import ChartRangeSelector from '../ChartRangeSelector';
import { filterByRange, sortByDateAsc, type RangeKey } from '../../utils/fhir';

interface LabPoint {
  date: string;
  value: number;
}

interface Props {
  title: string;
  unit: string;
  points: LabPoint[];
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  color: string;
  referenceBand?: { low: number; high: number };
  referenceLine?: number;
  yDomain?: [number, number];
}

export default function LabTrendChart({
  title,
  unit,
  points,
  range,
  onRangeChange,
  color,
  referenceBand,
  referenceLine,
  yDomain,
}: Props) {
  const theme = useTheme();
  const axisColor = theme.palette.text.secondary;

  const data = filterByRange(sortByDateAsc(points), range).map((p) => ({
    ...p,
    label: format(parseISO(p.date), 'MMM yy'),
  }));
  return (
    <WidgetCard
      title={title}
      action={<ChartRangeSelector value={range} onChange={onRangeChange} />}
      minHeight={300}
    >
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.8)} />
          <XAxis dataKey="label" stroke={axisColor} tick={{ fill: axisColor }} />
          <YAxis
            domain={yDomain ?? ['auto', 'auto']}
            unit={` ${unit}`}
            width={70}
            stroke={axisColor}
            tick={{ fill: axisColor }}
          />
          <Tooltip
            formatter={(v: number) => `${v} ${unit}`}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
            }}
          />
          {referenceBand && (
            <ReferenceArea
              y1={referenceBand.low}
              y2={referenceBand.high}
              fill={alpha(theme.palette.success.main, 0.18)}
            />
          )}
          {referenceLine != null && (
            <ReferenceLine
              y={referenceLine}
              stroke={theme.palette.warning.main}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
          )}
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
