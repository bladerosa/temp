import { Fragment, type ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
}

export interface PageHeaderProps {
  title: ReactNode;
  crumbs?: Crumb[];
  action?: ReactNode;
}

export function PageHeader({ title, crumbs, action }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      sx={{ gap: 6, flexWrap: 'wrap' }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h2" sx={{ fontSize: 24, lineHeight: '34px' }}>
          {title}
        </Typography>
        {crumbs && crumbs.length > 0 && (
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mt: 1.5 }}>
            {crumbs.map((c, i) => (
              <Fragment key={c.label}>
                {i > 0 && (
                  <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
                    <ChevronRight size={14} strokeWidth={2} />
                  </Box>
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: i === crumbs.length - 1 ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {c.label}
                </Typography>
              </Fragment>
            ))}
          </Stack>
        )}
      </Box>
      {action && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>{action}</Box>
      )}
    </Stack>
  );
}
