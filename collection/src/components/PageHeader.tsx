import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

// PageHeader — strict implementation of preview/components/Breadcrumb.html
// page-header anatomy:
//   - Breadcrumb trail: 12 caption mono-ish, secondary color, slash sep
//   - Title h2 (24/36/700)
//   - Subtitle body2 secondary
//   - Right-aligned action slot
//
// Used at the top of every dashboard page for navigation context.

export type Crumb = { label: string; to?: string };

export type PageHeaderProps = {
  crumbs?: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
};

export default function PageHeader({ crumbs, title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={3}
      sx={{ mb: 1 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {crumbs && crumbs.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ mb: 1.5, fontSize: 12, lineHeight: '16px', color: 'text.secondary' }}
          >
            {crumbs.map((c, i) => (
              <Stack key={`${c.label}-${i}`} direction="row" alignItems="center" gap={1}>
                {i > 0 && (
                  <Box component="span" sx={{ color: 'text.secondary', opacity: 0.5 }}>
                    /
                  </Box>
                )}
                <Box
                  component="span"
                  sx={{
                    color: i === crumbs.length - 1 ? 'text.primary' : 'text.secondary',
                    fontWeight: i === crumbs.length - 1 ? 500 : 400,
                  }}
                >
                  {c.label}
                </Box>
              </Stack>
            ))}
          </Stack>
        )}

        <Stack spacing={0.5}>
          <Typography variant="h2" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Box>

      {action && (
        <Box sx={{ flexShrink: 0, mt: { xs: 0, md: 4 } }}>
          {action}
        </Box>
      )}
    </Stack>
  );
}
