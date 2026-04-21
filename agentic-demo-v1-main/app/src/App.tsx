import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Stack } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PatientListPage from './pages/PatientListPage';
import PatientDashboardPage from './pages/PatientDashboardPage';

const APP_NAME = 'Hypertension Dashboard';
const APP_VERSION = '0.1.0';
const CURRENT_YEAR = new Date().getFullYear();
const COPYRIGHT_HOLDER = 'Heaptrace Demo';
const FOOTER_HEIGHT = { xs: 112, sm: 72 };
const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: 'https://www.atlassian.com/legal/privacy-policy' },
  { label: 'Terms of Service', href: 'https://www.atlassian.com/legal/terms' },
  { label: 'Help/Support', href: 'https://support.atlassian.com/' },
];

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
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
      <Container
        maxWidth="xl"
        sx={{
          py: 3,
          flexGrow: 1,
          pb: {
            xs: `calc(${FOOTER_HEIGHT.xs}px + 24px)`,
            sm: `calc(${FOOTER_HEIGHT.sm}px + 24px)`,
          },
        }}
      >
        <Routes>
          <Route path="/" element={<PatientListPage />} />
          <Route path="/patients/:id" element={<PatientDashboardPage />} />
        </Routes>
      </Container>
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: {
            xs: `${FOOTER_HEIGHT.xs}px`,
            sm: `${FOOTER_HEIGHT.sm}px`,
          },
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.25 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {APP_NAME} v{APP_VERSION} • © {CURRENT_YEAR} {COPYRIGHT_HOLDER}
            </Typography>
            <Stack component="nav" aria-label="Footer links" direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              {FOOTER_LINKS.map((link) => (
                <Typography
                  key={link.label}
                  component="a"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.label} (opens in new window)`}
                  variant="body2"
                  color="primary"
                  sx={{
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    '&:hover, &:focus-visible': { textDecorationThickness: '2px' },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
