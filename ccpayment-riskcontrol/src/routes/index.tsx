import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { paths } from './paths';
import { AuthGuard } from './AuthGuard';
import { PageLoader } from './PageLoader';

const RiskControlPage = lazy(() => import('@/pages/RiskControlPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={paths.root} element={<Navigate replace to={paths.dashboard.riskControl} />} />

        <Route
          path={paths.dashboard.root}
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate replace to={paths.dashboard.riskControl} />} />
          <Route path="risk-control" element={<RiskControlPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
