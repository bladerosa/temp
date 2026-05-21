import { makeAutoObservable } from 'mobx';
import { HOT_WALLET_RECORDS } from '@/data/mockData';
import type { HotWalletRecord } from '@/data/types';

/**
 * HotWalletStore — single source of truth for the 热钱包资产管理 page and the
 * supplier-refund txid binding flow.
 *
 * Real backend: incoming wallet transactions stream in as 入账 records; an
 * operator categorizes each via 点击标记 or via downstream flows (e.g., the
 * 供应商退款 binding inside the Sell USDT supplier refund modal). The store
 * mirrors that mutable list so the two views stay in sync during a session.
 */
export class HotWalletStore {
  records: HotWalletRecord[] = HOT_WALLET_RECORDS.map((r) => ({ ...r }));

  constructor() {
    makeAutoObservable(this);
  }

  findByTxid = (txid: string): HotWalletRecord | undefined => {
    return this.records.find((r) => r.txid === txid);
  };

  /**
   * Bind a txid to a sell-USDT order's supplier refund flow. Returns the
   * matched record, or an error code so the caller can surface a useful
   * message to the operator.
   */
  bindAsSupplierRefund = (
    txid: string,
    orderId: string,
  ):
    | { ok: true; record: HotWalletRecord }
    | { ok: false; reason: 'not-found' | 'wrong-account' | 'already-categorized' | 'already-bound-other' } => {
    const rec = this.records.find((r) => r.txid === txid);
    if (!rec) return { ok: false, reason: 'not-found' };
    if (rec.accountType !== '入账') return { ok: false, reason: 'wrong-account' };
    // Already bound to THIS order is OK — caller handles dedupe.
    if (rec.category === '供应商退款' && rec.remark !== '' && rec.remark !== orderId) {
      return { ok: false, reason: 'already-bound-other' };
    }
    if (rec.category !== '' && rec.category !== '供应商退款') {
      return { ok: false, reason: 'already-categorized' };
    }
    rec.category = '供应商退款';
    rec.remark = orderId;
    return { ok: true, record: rec };
  };

  /** Reverse the binding — used by the modal's 解绑 button. */
  unbindSupplierRefund = (txid: string) => {
    const rec = this.records.find((r) => r.txid === txid);
    if (!rec) return;
    if (rec.category !== '供应商退款') return;
    rec.category = '';
    rec.remark = '';
  };

  /** Re-hydrate the modal's bound list when re-opening for an order. */
  listBoundForOrder = (orderId: string): HotWalletRecord[] => {
    return this.records.filter((r) => r.category === '供应商退款' && r.remark === orderId);
  };
}
