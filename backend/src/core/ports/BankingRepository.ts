export type BankTransactionType = "BANK" | "APPLY";

export interface BankTransaction {
  id: string;
  routeId: string;
  year: number;
  amount: number;
  type: BankTransactionType;
  balanceAfter: number;
  createdAt: string;
}

export interface BankSnapshot {
  balance: number;
  transactions: BankTransaction[];
}

export interface BankingRepository {
  getSnapshot(): Promise<BankSnapshot>;
  saveSnapshot(snapshot: BankSnapshot): Promise<void>;
  hasBanked(routeId: string, year: number): Promise<boolean>;
  addTransaction(
    transaction: Omit<BankTransaction, "id" | "createdAt">
  ): Promise<BankSnapshot>;
}
