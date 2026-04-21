import { differenceInYears, parseISO, subMonths } from 'date-fns';

export interface HumanName {
  family?: string;
  given?: string[];
  prefix?: string[];
}

export const formatHumanName = (names?: HumanName[]): string => {
  if (!names?.length) return 'Unknown';
  const n = names[0];
  const given = (n.given ?? []).join(' ');
  return [n.prefix?.join(' '), given, n.family].filter(Boolean).join(' ').trim();
};

export const calculateAge = (birthDate?: string): number | undefined => {
  if (!birthDate) return undefined;
  return differenceInYears(new Date(), parseISO(birthDate));
};

export const getMRN = (patient: any): string => {
  const ids: any[] = patient?.identifier ?? [];
  const byType = ids.find((i) =>
    i?.type?.coding?.some((c: any) => c.code === 'MR'),
  );
  if (byType?.value) return byType.value;
  const bySystem = ids.find((i) => i.system?.toLowerCase?.().includes('mrn'));
  if (bySystem?.value) return bySystem.value;
  return ids[0]?.value ?? patient?.id ?? '—';
};

export interface BPReading {
  date: string;
  systolic: number;
  diastolic: number;
}

export const parseBPPanel = (obs: any): BPReading | null => {
  const date = obs?.effectiveDateTime;
  if (!date || !Array.isArray(obs.component)) return null;
  const find = (loinc: string) =>
    obs.component.find((c: any) =>
      c.code?.coding?.some((code: any) => code.code === loinc),
    )?.valueQuantity?.value;
  const systolic = find('8480-6');
  const diastolic = find('8462-4');
  if (typeof systolic !== 'number' || typeof diastolic !== 'number') return null;
  return { date, systolic, diastolic };
};

export const getObservationValue = (obs: any): number | undefined =>
  obs?.valueQuantity?.value;

export const getObservationText = (obs: any): string | undefined =>
  obs?.valueCodeableConcept?.text ??
  obs?.valueCodeableConcept?.coding?.[0]?.display;

export type BPStatus = 'controlled' | 'elevated' | 'uncontrolled' | 'unknown';

export const classifyBP = (reading?: BPReading | null): BPStatus => {
  if (!reading) return 'unknown';
  const { systolic, diastolic } = reading;
  if (systolic >= 140 || diastolic >= 90) return 'uncontrolled';
  if (systolic >= 130 || diastolic >= 80) return 'elevated';
  return 'controlled';
};

export const BP_STATUS_META: Record<BPStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  controlled: { label: 'Controlled (<130/80)', color: 'success' },
  elevated: { label: 'Elevated (130–139/80–89)', color: 'warning' },
  uncontrolled: { label: 'Uncontrolled (≥140/90)', color: 'error' },
  unknown: { label: 'No recent BP', color: 'default' },
};

export type RangeKey = '3m' | '6m' | '1y' | 'all';
export const RANGE_MONTHS: Record<RangeKey, number | null> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
  all: null,
};

export const filterByRange = <T extends { date: string }>(items: T[], range: RangeKey): T[] => {
  const months = RANGE_MONTHS[range];
  if (months == null) return items;
  const cutoff = subMonths(new Date(), months);
  return items.filter((i) => parseISO(i.date) >= cutoff);
};

export const sortByDateAsc = <T extends { date: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.date.localeCompare(b.date));
