import {
  Archive,
  Calendar,
  CircleDollarSign,
  Code,
  CreditCard,
  FileText,
  Info,
  LayoutGrid,
  Star,
  TrendingUp,
  User,
  UserCheck,
  Wallet,
  Webhook,
  type LucideIcon,
} from 'lucide-react';
import { PATHS } from '@/routes/paths';

export interface NavChild {
  key: string;
  label: string;
  path?: string;
  badge?: string;
}

export interface NavItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  path?: string;
  arrow?: boolean;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutGrid, path: PATHS.dashboard },
  { key: 'rewards', label: 'Rewards Center', Icon: Star },
  { key: 'transaction', label: 'Transaction', Icon: CircleDollarSign },
  { key: 'apiorder', label: 'API Order', Icon: Calendar, arrow: true },
  { key: 'invoice', label: 'Invoice', Icon: FileText },
  { key: 'payouts', label: 'Mass Payouts', Icon: CreditCard },
  { key: 'balance', label: 'Balance', Icon: Wallet, arrow: true },
  { key: 'userassets', label: 'User Assets', Icon: User, arrow: true },
  { key: 'developer', label: 'Developer', Icon: Code, path: PATHS.developer },
  { key: 'webhook', label: 'Webhook', Icon: Webhook },
  {
    key: 'settings',
    label: 'Merchant Settings',
    Icon: Archive,
    arrow: true,
    children: [
      { key: 'ms-branding', label: 'Branding' },
      { key: 'ms-settings', label: 'Settings', path: PATHS.msSettings },
      { key: 'ms-security', label: 'Security' },
      { key: 'ms-verification', label: 'Verification' },
      { key: 'ms-member', label: 'Member', badge: '1' },
      { key: 'ms-financial', label: 'Financial Statement' },
    ],
  },
  { key: 'approval', label: 'Withdrawal Approval', Icon: UserCheck, arrow: true },
  { key: 'affiliate', label: 'Affiliate Program', Icon: TrendingUp },
  { key: 'fee', label: 'Fee Inquiry', Icon: Info },
];
