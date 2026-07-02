import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { paths } from './paths';
import { AuthGuard } from './AuthGuard';
import { PageLoader } from './PageLoader';

const MerchantPage = lazy(() => import('@/pages/MerchantPage'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const AggregationFeeDetailPage = lazy(() => import('@/pages/AggregationFeeDetailPage'));
const ServiceFeeDetailPage = lazy(() => import('@/pages/ServiceFeeDetailPage'));
const SwapFeeDetailPage = lazy(() => import('@/pages/SwapFeeDetailPage'));
const WithdrawFeeDetailPage = lazy(() => import('@/pages/WithdrawFeeDetailPage'));
const FinancePage = lazy(() => import('@/pages/FinancePage'));
const SystemPage = lazy(() => import('@/pages/SystemPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={paths.root} element={<Navigate replace to={paths.dashboard.merchant} />} />

        <Route
          path={paths.dashboard.root}
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate replace to={paths.dashboard.merchant} />} />
          <Route path="merchant" element={<MerchantPage />} />
          <Route path="merchant/detail" element={<DetailPage />} />
          <Route path="merchant/aggregation-fee-detail" element={<AggregationFeeDetailPage />} />
          <Route path="merchant/service-fee-detail" element={<ServiceFeeDetailPage />} />
          <Route path="merchant/swap-fee-detail" element={<SwapFeeDetailPage />} />
          <Route path="merchant/withdraw-fee-detail" element={<WithdrawFeeDetailPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="system" element={<SystemPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
