import { List, ListItem, ListItemText, Chip, Typography, Stack } from '@mui/material';
import { format, parseISO } from 'date-fns';
import WidgetCard from './WidgetCard';

interface Props {
  conditions: any[];
}

const conditionDisplay = (c: any) =>
  c?.code?.text ?? c?.code?.coding?.[0]?.display ?? 'Condition';

const conditionCode = (c: any) => c?.code?.coding?.[0]?.code;

export default function ConditionsWidget({ conditions }: Props) {
  return (
    <WidgetCard title="Problem List">
      {conditions.length === 0 ? (
        <Typography color="text.secondary">No active conditions</Typography>
      ) : (
        <List dense disablePadding>
          {conditions.map((c) => (
            <ListItem key={c.id} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {conditionDisplay(c)}
                    </Typography>
                    {conditionCode(c) && <Chip label={conditionCode(c)} size="small" />}
                  </Stack>
                }
                secondary={
                  c.onsetDateTime
                    ? `Onset ${format(parseISO(c.onsetDateTime), 'MMM yyyy')}`
                    : undefined
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </WidgetCard>
  );
}
