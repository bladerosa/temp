import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { SellUsdtPage } from '@/pages/SellUsdtPage';
import { MerchantDetailPage } from '@/pages/MerchantDetailPage';
import { HotWalletPage } from '@/pages/HotWalletPage';
import { StubPage } from '@/pages/StubPage';
import { PATHS } from './paths';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={PATHS.root} element={<Navigate to={PATHS.sellUsdt} replace />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Navigate to={PATHS.sellUsdt} replace />} />
        <Route path="sell-usdt" element={<SellUsdtPage />} />
        <Route path="merchant/list/detail" element={<MerchantDetailPage />} />
        <Route path="hot-wallet/assets" element={<HotWalletPage />} />
        <Route path="stub/:key" element={<StubPage />} />
      </Route>
      <Route path="*" element={<Navigate to={PATHS.sellUsdt} replace />} />
    </Routes>
  );
}
