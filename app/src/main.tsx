import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import App from './App';
import { createAppTheme, THEME_MODE_STORAGE_KEY, type ThemeMode } from './theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

function getInitialThemeMode(): ThemeMode {
  const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
  return savedMode === 'dark' ? 'dark' : 'light';
}

function Root() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  useEffect(() => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
  }, [themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App
            themeMode={themeMode}
            onToggleTheme={() => setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
          />
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
