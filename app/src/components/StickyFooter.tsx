import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface Props {
  appName: string;
  version: string;
  copyright: string;
  links: FooterLink[];
}

export default function StickyFooter({ appName, version, copyright, links }: Props) {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderTop: '1px solid',
        borderColor: 'primary.dark',
        py: 1,
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.5, sm: 2 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexWrap="wrap"
        >
          <Typography variant="caption" sx={{ opacity: 0.9, whiteSpace: 'nowrap' }}>
            {appName}&nbsp;&bull;&nbsp;{version}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.75, whiteSpace: 'nowrap' }}>
            {copyright}
          </Typography>

          {links.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 0.25 }}
                />
              }
              sx={{ ml: { sm: 'auto' } }}
            >
              {links.map(({ label, href, external }) => (
                <Link
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  variant="caption"
                  sx={{
                    color: 'primary.contrastText',
                    opacity: 0.85,
                    textDecoration: 'none',
                    '&:hover': { opacity: 1, textDecoration: 'underline' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.contrastText',
                      outlineOffset: 2,
                      borderRadius: 0.5,
                    },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
