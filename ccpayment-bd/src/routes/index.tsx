import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { paths } from './paths';
import { NotFound, PageLoader } from '@/components/NotFound';

const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const ConsoleLayout = lazy(() => import('@/layouts/ConsoleLayout'));
const MerchantLayout = lazy(() => import('@/layouts/MerchantLayout'));

const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const Forgot = lazy(() => import('@/pages/auth/Forgot'));
const Reset = lazy(() => import('@/pages/auth/Reset'));
const Success = lazy(() => import('@/pages/auth/Success'));
const VerifySignup = lazy(() => import('@/pages/auth/VerifySignup'));

const Settlements = lazy(() => import('@/pages/promoter/Settlements'));
const Promoters = lazy(() => import('@/pages/console/Promoters'));
const Withdrawals = lazy(() => import('@/pages/console/Withdrawals'));
const BDLanding = lazy(() => import('@/pages/merchant/BDLanding'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={paths.root} element={<Navigate to={paths.auth.login} replace />} />

        <Route element={<AuthLayout />}>
          <Route path={paths.auth.login} element={<Login />} />
          <Route path={paths.auth.signup} element={<Signup />} />
          <Route path={paths.auth.forgot} element={<Forgot />} />
          <Route path={paths.auth.reset} element={<Reset />} />
          <Route path={paths.auth.success} element={<Success />} />
          <Route path={paths.auth.verifySignup} element={<VerifySignup />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path={paths.promoter.settlements} element={<Settlements />} />
        </Route>

        <Route element={<ConsoleLayout />}>
          <Route path={paths.console.promoters} element={<Promoters />} />
          <Route path={paths.console.withdrawals} element={<Withdrawals />} />
        </Route>

        <Route element={<MerchantLayout />}>
          <Route path={paths.merchant.bd} element={<BDLanding />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
