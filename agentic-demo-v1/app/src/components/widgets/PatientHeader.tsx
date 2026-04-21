import { Paper, Box, Typography, Chip, Stack, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { calculateAge, formatHumanName, getMRN } from '../../utils/fhir';

interface Props {
  patient: any;
}

export default function PatientHeader({ patient }: Props) {
  if (!patient) return null;
  const name = formatHumanName(patient.name);
  const age = calculateAge(patient.birthDate);
  const mrn = getMRN(patient);
  const phone = patient.telecom?.find((t: any) => t.system === 'phone')?.value;
  const addr = patient.address?.[0];
  const addressLine = addr
    ? [addr.line?.join(' '), addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')
    : null;

  return (
    <Paper sx={{ p: 2.5, height: '100%' }} elevation={1}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip label={`MRN ${mrn}`} size="small" />
            {age != null && <Chip label={`${age} y`} size="small" />}
            {patient.gender && (
              <Chip
                label={patient.gender}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            )}
          </Stack>

          {patient.birthDate && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              DOB {patient.birthDate}
            </Typography>
          )}
          {phone && (
            <Typography variant="body2" color="text.secondary">
              Phone {phone}
            </Typography>
          )}
          {addressLine && (
            <Typography variant="body2" color="text.secondary">
              {addressLine}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
