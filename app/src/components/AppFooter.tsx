import { Box, Container, Link, Stack, Typography } from '@mui/material';

const APP_NAME = 'Hypertension Dashboard';
const APP_VERSION = '0.1.0';
const APP_COPYRIGHT = `© ${new Date().getFullYear()} Heaptrace Demo`;

const utilityLinks = ['Privacy', 'Terms', 'Help'];

export default function AppFooter() {
  return (
    <Box component="footer" sx={{ py: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 0.75, md: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1 }} useFlexGap flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              {APP_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`v${APP_VERSION}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {APP_COPYRIGHT}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {utilityLinks.map((label) => (
              <Link
                key={label}
                href="#"
                variant="body2"
                color="text.secondary"
                underline="hover"
                onClick={(event) => event.preventDefault()}
              >
                {label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
