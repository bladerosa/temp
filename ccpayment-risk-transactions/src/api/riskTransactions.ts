/**
 * 风险交易数据的唯一取数入口。
 *
 * 现在从 `src/data` 的 fixtures 返回；接后端时只改这一层，
 * store 与页面不需要改动。
 */
import {
  PAYMENTS,
  WITHDRAWALS,
  type RiskPayment,
  type RiskWithdrawal,
} from '@/data/riskTransactions';

const delay = <T>(value: T, ms = 120) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });

export interface HighRiskSettings {
  /** 自動退款 / 手動重新處理 */
  mode: 'auto' | 'manual';
  /** 原路退回 / 指定地址 */
  path: string;
  /** 自動退款觸發值（USD） */
  threshold: string;
}

export const riskTransactionsApi = {
  listPayments: (): Promise<RiskPayment[]> => delay(PAYMENTS),

  listWithdrawals: (): Promise<RiskWithdrawal[]> => delay(WITHDRAWALS),

  /** 原型未接后端，确认后仅回显已保存的配置。 */
  saveHighRiskSettings: (settings: HighRiskSettings): Promise<HighRiskSettings> =>
    delay(settings),
};
