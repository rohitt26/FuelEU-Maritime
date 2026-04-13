import {
  BankingRepository,
  BankSnapshot,
  BankTransaction
} from "../../../core/ports/BankingRepository";
import { connectionPool } from "../../../infrastructure/db";

export class BankingRepositoryPg implements BankingRepository {
  async getSnapshot(): Promise<BankSnapshot> {
    const [snapshotResult, transactionsResult] = await Promise.all([
      connectionPool.query("SELECT balance FROM bank_snapshot WHERE id = 1"),
      connectionPool.query(
        `SELECT id, route_id, year, amount, type, balance_after, created_at
         FROM bank_transactions
         ORDER BY created_at DESC`
      )
    ]);

    const balance =
      snapshotResult.rows.length > 0 ? Number(snapshotResult.rows[0].balance) : 0;

    const transactions: BankTransaction[] = transactionsResult.rows.map(row => ({
      id: row.id,
      routeId: row.route_id,
      year: Number(row.year),
      amount: Number(row.amount),
      type: row.type,
      balanceAfter: Number(row.balance_after),
      createdAt: new Date(row.created_at).toISOString()
    }));

    return { balance, transactions };
  }

  async saveSnapshot(snapshot: BankSnapshot): Promise<void> {
    const client = await connectionPool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO bank_snapshot (id, balance)
         VALUES (1, $1)
         ON CONFLICT (id)
         DO UPDATE SET balance = EXCLUDED.balance`,
        [snapshot.balance]
      );
      await client.query("DELETE FROM bank_transactions");

      for (const transaction of snapshot.transactions) {
        await client.query(
          `INSERT INTO bank_transactions
            (id, route_id, year, amount, type, balance_after, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            transaction.id,
            transaction.routeId,
            transaction.year,
            transaction.amount,
            transaction.type,
            transaction.balanceAfter,
            transaction.createdAt
          ]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async hasBanked(routeId: string, year: number): Promise<boolean> {
    const result = await connectionPool.query(
      `SELECT 1
       FROM bank_transactions
       WHERE route_id = $1 AND year = $2 AND type = 'BANK'
       LIMIT 1`,
      [routeId, year]
    );
    return result.rows.length > 0;
  }

  async addTransaction(
    transaction: Omit<BankTransaction, "id" | "createdAt">
  ): Promise<BankSnapshot> {
    const txId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const createdAt = new Date().toISOString();

    await connectionPool.query(
      `INSERT INTO bank_transactions
        (id, route_id, year, amount, type, balance_after, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        txId,
        transaction.routeId,
        transaction.year,
        transaction.amount,
        transaction.type,
        transaction.balanceAfter,
        createdAt
      ]
    );

    await connectionPool.query(
      `INSERT INTO bank_snapshot (id, balance)
       VALUES (1, $1)
       ON CONFLICT (id)
       DO UPDATE SET balance = EXCLUDED.balance`,
      [transaction.balanceAfter]
    );

    return this.getSnapshot();
  }
}
