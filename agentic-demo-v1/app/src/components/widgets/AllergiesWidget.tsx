import { List, ListItem, ListItemText, Chip, Typography, Stack } from '@mui/material';
import WidgetCard from './WidgetCard';

interface Props {
  allergies: any[];
}

const criticalityColor = (c?: string) =>
  c === 'high' ? 'error' : c === 'low' ? 'default' : 'warning';

export default function AllergiesWidget({ allergies }: Props) {
  return (
    <WidgetCard title="Allergies">
      {allergies.length === 0 ? (
        <Typography color="text.secondary">No known allergies</Typography>
      ) : (
        <List dense disablePadding>
          {allergies.map((a) => (
            <ListItem key={a.id} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {a.code?.text ?? 'Unknown'}
                    </Typography>
                    {a.criticality && (
                      <Chip
                        label={a.criticality}
                        size="small"
                        color={criticalityColor(a.criticality) as any}
                      />
                    )}
                  </Stack>
                }
                secondary={a.reaction?.[0]?.manifestation?.[0]?.text}
              />
            </ListItem>
          ))}
        </List>
      )}
    </WidgetCard>
  );
}
