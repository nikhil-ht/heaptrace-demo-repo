import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  minHeight?: number;
}

export default function WidgetCard({ title, action, children, minHeight }: Props) {
  return (
    <Card sx={{ height: '100%', minHeight }} elevation={1}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
