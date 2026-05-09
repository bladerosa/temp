// Centralized path constants — used by NavLinks, redirects, and tests so
// route renames stay one-edit changes.

export const paths = {
  root: '/',
  dashboard: {
    root: '/dashboard',
    collection: {
      auto: '/dashboard/collection/auto',
      manual: '/dashboard/collection/manual',
      jobs: '/dashboard/collection/jobs',
    },
  },
} as const;
