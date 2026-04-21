import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Link } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PatientListPage from './pages/PatientListPage';
import PatientDashboardPage from './pages/PatientDashboardPage';

const footerLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
  { label: 'Help/Support', to: '/help-support' },
];
const APP_VERSION = '0.1.0';
const CURRENT_YEAR = new Date().getFullYear();

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <MonitorHeartIcon sx={{ mr: 1.5 }} />
          <Typography
            component={RouterLink}
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
      <Container component="main" maxWidth="xl" sx={{ py: 3, flexGrow: 1, pb: { xs: 14, sm: 11 } }}>
        <Routes>
          <Route path="/" element={<PatientListPage />} />
          <Route path="/patients/:id" element={<PatientDashboardPage />} />
          <Route
            path="/privacy-policy"
            element={<Typography variant="h5">Privacy Policy details coming soon.</Typography>}
          />
          <Route
            path="/terms-of-service"
            element={<Typography variant="h5">Terms of Service details coming soon.</Typography>}
          />
          <Route
            path="/help-support"
            element={<Typography variant="h5">Help and support information coming soon.</Typography>}
          />
        </Routes>
      </Container>
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Hypertension Dashboard v{APP_VERSION} © {CURRENT_YEAR} Heaptrace
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {footerLinks.map((item) => (
                <Link
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  variant="body2"
                  color="inherit"
                  underline="hover"
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
