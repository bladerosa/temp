import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { paths } from './paths';

// Lazy-loaded pages keep the initial bundle small. Suspense boundary
// renders a top-of-viewport progress bar while a chunk is in flight.
const AutoCollection = lazy(() => import('@/pages/AutoCollection'));
const ManualCollection = lazy(() => import('@/pages/ManualCollection'));
const CollectionJobs = lazy(() => import('@/pages/CollectionJobs'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.modal + 1 }}>
      <LinearProgress />
    </Box>
  );
}

// Production auth seam — replace with real session check later.
function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={paths.root} element={<Navigate to={paths.dashboard.collection.auto} replace />} />
        <Route
          path={`${paths.dashboard.root}/*`}
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route path="collection/auto" element={<AutoCollection />} />
          <Route path="collection/manual" element={<ManualCollection />} />
          <Route path="collection/jobs" element={<CollectionJobs />} />
          <Route
            index
            element={<Navigate to={paths.dashboard.collection.auto} replace />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
