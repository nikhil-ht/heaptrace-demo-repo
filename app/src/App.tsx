import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PatientListPage from './pages/PatientListPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import StickyFooter from './components/StickyFooter';

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy', external: false },
  { label: 'Terms of Service', href: '/terms', external: false },
  { label: 'Help / Support', href: '/support', external: false },
];

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '44px' }}>
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
      <StickyFooter
        appName="Hypertension Dashboard"
        version="v0.1.0"
        copyright="© 2026 Heaptrace"
        links={FOOTER_LINKS}
      />
    </Box>
  );
}
