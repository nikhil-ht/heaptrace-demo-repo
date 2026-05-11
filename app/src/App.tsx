import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Tooltip } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PatientListPage from './pages/PatientListPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import type { ThemeMode } from './theme';

interface Props {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export default function App({ themeMode, onToggleTheme }: Props) {
  const toggleLabel = themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <MonitorHeartIcon sx={{ mr: 1.5 }} />
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
          >
            Hypertension Dashboard
          </Typography>
          <Tooltip title={toggleLabel}>
            <IconButton color="inherit" onClick={onToggleTheme} aria-label={toggleLabel} sx={{ mr: 1 }}>
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            FHIR demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<PatientListPage />} />
          <Route path="/patients/:id" element={<PatientDashboardPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
