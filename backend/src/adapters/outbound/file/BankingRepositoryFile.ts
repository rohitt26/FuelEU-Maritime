import fs from "fs/promises";
import path from "path";
import {
  BankingRepository,
  BankSnapshot,
  BankTransaction
} from "../../../core/ports/BankingRepository";

const filePath = path.join(__dirname, "../../../data/banking.json");

export class BankingRepositoryFile implements BankingRepository {
  private async readFile(): Promise<unknown> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || '{"balance":0,"transactions":[]}');
  }

  private normalizeSnapshot(data: unknown): BankSnapshot {
    if (Array.isArray(data)) {
      const legacyBalance = data.reduce((sum, entry) => {
        if (
          typeof entry === "object" &&
          entry !== null &&
          "amount" in entry &&
          typeof entry.amount === "number"
        ) {
          return sum + entry.amount;
        }

        return sum;
      }, 0);

      return {
        balance: legacyBalance,
        transactions: []
      };
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "balance" in data &&
      "transactions" in data &&
      typeof data.balance === "number" &&
      Array.isArray(data.transactions)
    ) {
      return {
        balance: data.balance,
        transactions: data.transactions as BankTransaction[]
      };
    }

    return {
      balance: 0,
      transactions: []
    };
  }

  async getSnapshot(): Promise<BankSnapshot> {
    const data = await this.readFile();
    return this.normalizeSnapshot(data);
  }

  async saveSnapshot(snapshot: BankSnapshot): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2));
  }

  async hasBanked(routeId: string, year: number): Promise<boolean> {
    const snapshot = await this.getSnapshot();
    return snapshot.transactions.some(
      transaction =>
        transaction.type === "BANK" &&
        transaction.routeId === routeId &&
        transaction.year === year
    );
  }

  async addTransaction(
    transaction: Omit<BankTransaction, "id" | "createdAt">
  ): Promise<BankSnapshot> {
    const snapshot = await this.getSnapshot();
    const nextSnapshot: BankSnapshot = {
      balance: transaction.balanceAfter,
      transactions: [
        {
          ...transaction,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          createdAt: new Date().toISOString()
        },
        ...snapshot.transactions
      ]
    };

    await this.saveSnapshot(nextSnapshot);
    return nextSnapshot;
  }
}
