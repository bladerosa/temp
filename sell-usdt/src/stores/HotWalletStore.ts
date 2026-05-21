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
   * Tolerant lookup used by the supplier-refund binding flow.
   *
   * Real txids are 64-ish opaque hex chars and the page displays them in a
   * truncated form (head … tail). Operators commonly read off the truncated
   * display rather than clicking 复制, so we accept:
   *   1) Exact match
   *   2) Unique prefix match (when input ≥ 12 chars matches one record's head)
   *   3) Unique prefix+suffix match (mirrors the visible truncation pattern)
   * Returns the matched record or undefined when ambiguous / nothing matched.
   */
  findByTxidFuzzy = (raw: string): HotWalletRecord | undefined => {
    const t = raw.trim();
    if (!t) return undefined;
    const exact = this.records.find((r) => r.txid === t);
    if (exact) return exact;
    if (t.length >= 12) {
      const prefix = t.slice(0, 10);
      const byPrefix = this.records.filter((r) => r.txid.startsWith(prefix));
      if (byPrefix.length === 1) return byPrefix[0];
    }
    if (t.length >= 16) {
      const prefix = t.slice(0, 8);
      const suffix = t.slice(-8);
      const byEnds = this.records.filter(
        (r) => r.txid.startsWith(prefix) && r.txid.endsWith(suffix),
      );
      if (byEnds.length === 1) return byEnds[0];
    }
    return undefined;
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
    | {
        ok: false;
        reason:
          | 'not-found'
          | 'wrong-account'
          | 'wrong-currency'
          | 'already-categorized'
          | 'already-bound-other';
      } => {
    const rec = this.findByTxidFuzzy(txid);
    if (!rec) return { ok: false, reason: 'not-found' };
    if (rec.accountType !== '入账') return { ok: false, reason: 'wrong-account' };
    if (rec.currency !== 'USDT') return { ok: false, reason: 'wrong-currency' };
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
    const rec = this.findByTxidFuzzy(txid) ?? this.records.find((r) => r.txid === txid);
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
