import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { PATHS } from './paths';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DeveloperPage = lazy(() => import('@/pages/DeveloperPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function PageLoader() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
      <CircularProgress size={28} />
    </Box>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={PATHS.root} element={<Navigate to={PATHS.dashboard} replace />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to={PATHS.dashboard} replace />} />
          <Route path="overview" element={<DashboardPage />} />
          <Route path="developer" element={<DeveloperPage />} />
          <Route path="merchant-settings/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={PATHS.dashboard} replace />} />
      </Routes>
    </Suspense>
  );
}
