import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="label" />
          <YAxis domain={yDomain ?? ['auto', 'auto']} unit={` ${unit}`} width={70} />
          <Tooltip formatter={(v: number) => `${v} ${unit}`} />
          {referenceBand && (
            <ReferenceArea
              y1={referenceBand.low}
              y2={referenceBand.high}
              fill="#e8f5e9"
              fillOpacity={0.6}
            />
          )}
          {referenceLine != null && (
            <Line
              type="linear"
              dataKey={() => referenceLine}
              stroke="#f57c00"
              strokeDasharray="4 4"
              dot={false}
              legendType="none"
            />
          )}
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
