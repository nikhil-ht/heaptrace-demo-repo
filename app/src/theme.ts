import { createTheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

export const THEME_MODE_STORAGE_KEY = 'themeMode';

export function createAppTheme(mode: ThemeMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#1565c0' },
      secondary: { main: '#00897b' },
      background:
        mode === 'light'
          ? { default: '#f4f6f9', paper: '#ffffff' }
          : { default: '#0f172a', paper: '#111827' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h6: { fontWeight: 600 },
    },
  });
}
