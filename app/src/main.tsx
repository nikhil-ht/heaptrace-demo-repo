import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme, type ThemeMode } from './theme';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

const THEME_MODE_STORAGE_KEY = 'kan-4-theme-mode';

function getInitialThemeMode(): ThemeMode {
  const stored = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function Root() {
  const [mode, setMode] = React.useState<ThemeMode>(getInitialThemeMode);

  React.useEffect(() => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  }, [mode]);

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);
  const toggleTheme = React.useCallback(() => {
    setMode((current: ThemeMode) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App mode={mode} onToggleTheme={toggleTheme} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
