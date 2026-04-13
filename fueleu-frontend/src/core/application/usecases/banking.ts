import type {
  ApplyBankedResult,
  BankRecord,
  ComplianceBalance,
} from "../../domain/Compliance";

export interface BankingSnapshot {
  cb: ComplianceBalance;
  bank: BankRecord;
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
  Boolean(snapshot && snapshot.cb.cb > 0 && snapshot.bank.amount <= 0);

export const canApplyBanked = (
  snapshot: BankingSnapshot | null,
  amount: number
) =>
  Boolean(
    snapshot &&
      snapshot.cb.cb < 0 &&
      snapshot.bank.amount > 0 &&
      amount > 0 &&
      amount <= snapshot.bank.amount
  );
