import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export type AppThemeMode = 'light' | 'dark';

export interface ChartColors {
  grid: string;
  targetSystolic: string;
  targetDiastolic: string;
  bpSystolic: string;
  bpDiastolic: string;
  referenceBand: string;
  referenceLine: string;
  potassiumLine: string;
  egfrLine: string;
  weightLine: string;
  timeline: {
    emergency: string;
    inpatient: string;
    ambulatory: string;
    default: string;
    text: string;
  };
}

const chartColorsByMode: Record<AppThemeMode, ChartColors> = {
  light: {
    grid: '#d9e0e7',
    targetSystolic: '#f57c00',
    targetDiastolic: '#0288d1',
    bpSystolic: '#c62828',
    bpDiastolic: '#1565c0',
    referenceBand: '#e8f5e9',
    referenceLine: '#f57c00',
    potassiumLine: '#6a1b9a',
    egfrLine: '#00897b',
    weightLine: '#d84315',
    timeline: {
      emergency: '#c62828',
      inpatient: '#6a1b9a',
      ambulatory: '#1565c0',
      default: '#455a64',
      text: '#ffffff',
    },
  },
  dark: {
    grid: '#3f4a57',
    targetSystolic: '#ffb74d',
    targetDiastolic: '#4fc3f7',
    bpSystolic: '#ef5350',
    bpDiastolic: '#64b5f6',
    referenceBand: '#1f3a28',
    referenceLine: '#ffb74d',
    potassiumLine: '#ce93d8',
    egfrLine: '#4db6ac',
    weightLine: '#ff8a65',
    timeline: {
      emergency: '#ef5350',
      inpatient: '#ba68c8',
      ambulatory: '#64b5f6',
      default: '#90a4ae',
      text: '#0f1115',
    },
  },
};

export const createAppTheme = (mode: AppThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#1565c0' },
      secondary: { main: '#00897b' },
      background:
        mode === 'dark'
          ? { default: '#111827', paper: '#1f2937' }
          : { default: '#f4f6f9', paper: '#ffffff' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h6: { fontWeight: 600 },
    },
  });

export const getChartColors = (theme: Theme): ChartColors =>
  chartColorsByMode[theme.palette.mode as AppThemeMode];
