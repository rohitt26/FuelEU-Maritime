import type {
  ApplyBankedResult,
  BankRecord,
  BankTransaction,
  ComplianceBalance,
} from "../../domain/Compliance";
import type { Route } from "../../domain/Route";

export interface BankingSnapshot {
  cb: ComplianceBalance;
  bank: BankRecord;
}

export interface BankingTableRow extends Route {
  cb: number | null;
  isCalculated: boolean;
  alreadyBanked: boolean;
}

export interface BankingKpis {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}

export const getBankingKpis = (
  snapshot: BankingSnapshot | null,
  lastApplication: ApplyBankedResult | null
): BankingKpis => {
  if (lastApplication) {
    return {
      cbBefore: lastApplication.cb_before,
      applied: lastApplication.applied,
      cbAfter: lastApplication.cb_after,
    };
  }

  if (!snapshot) {
    return {
      cbBefore: 0,
      applied: 0,
      cbAfter: 0,
    };
  }

  return {
    cbBefore: snapshot.cb.cb,
    applied: 0,
    cbAfter: snapshot.cb.cb,
  };
};

export const canBankSurplus = (snapshot: BankingSnapshot | null) =>
  Boolean(snapshot && snapshot.cb.cb > 0);

export const canApplyBanked = (
  snapshot: BankingSnapshot | null,
  amount: number
) =>
  Boolean(
      snapshot &&
      snapshot.cb.cb < 0 &&
      snapshot.bank.balance > 0 &&
      amount > 0 &&
      amount <= snapshot.bank.balance
  );

export const buildBankingRows = (
  routes: Route[],
  balances: ComplianceBalance[],
  transactions: BankTransaction[]
): BankingTableRow[] => {
  const balanceMap = new Map(
    balances.map((balance) => [`${balance.routeId}-${balance.year}`, balance])
  );
  const bankedKeys = new Set(
    transactions
      .filter((transaction) => transaction.type === "BANK")
      .map((transaction) => `${transaction.routeId}-${transaction.year}`)
  );

  return routes
    .map((route) => {
      const key = `${route.routeId}-${route.year}`;
      const balance = balanceMap.get(key);

      return {
        ...route,
        cb: balance?.cb ?? null,
        isCalculated: Boolean(balance),
        alreadyBanked: bankedKeys.has(key),
      };
    })
    .sort((left, right) => right.year - left.year || left.routeId.localeCompare(right.routeId));
};
