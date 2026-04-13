import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import { Route } from "../core/domain/Route";
import { ComplianceRecord } from "../core/ports/ComplianceRepository";
import { BankSnapshot, BankTransaction } from "../core/ports/BankingRepository";
import { Pool as CompliancePool } from "../core/ports/PoolRepository";

const connectionPool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "postgres",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "12345"
});

const dataDirCandidates = [
  path.join(__dirname, "../seed-data"),
  path.join(__dirname, "../../src/seed-data")
];

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  for (const baseDir of dataDirCandidates) {
    try {
      const filePath = path.join(baseDir, fileName);
      const raw = await fs.readFile(filePath, "utf-8");
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      continue;
    }
  }
  return fallback;
}

export async function initDatabase(): Promise<void> {
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS routes (
      route_id TEXT NOT NULL,
      vessel_type TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      year INTEGER NOT NULL,
      ghg_intensity DOUBLE PRECISION NOT NULL,
      fuel_consumption DOUBLE PRECISION NOT NULL,
      distance DOUBLE PRECISION NOT NULL,
      total_emissions DOUBLE PRECISION NOT NULL,
      is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (route_id, year)
    );
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS compliance_records (
      route_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      cb DOUBLE PRECISION NOT NULL,
      PRIMARY KEY (route_id, year)
    );
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS bank_snapshot (
      id INTEGER PRIMARY KEY,
      balance DOUBLE PRECISION NOT NULL
    );
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id TEXT PRIMARY KEY,
      route_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('BANK', 'APPLY')),
      balance_after DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS pools (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS pool_members (
      pool_id TEXT NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
      route_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      cb_before DOUBLE PRECISION NOT NULL,
      cb_after DOUBLE PRECISION NOT NULL
    );
  `);

  await seedFromJsonIfEmpty();
}

async function seedFromJsonIfEmpty(): Promise<void> {
  const routesCount = await connectionPool.query("SELECT COUNT(*)::int AS count FROM routes");
  if (routesCount.rows[0].count === 0) {
    const routes = await readJsonFile<Route[]>("routes.json", []);
    for (const route of routes) {
      await connectionPool.query(
        `INSERT INTO routes (
          route_id, vessel_type, fuel_type, year, ghg_intensity,
          fuel_consumption, distance, total_emissions, is_baseline
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          route.routeId,
          route.vesselType,
          route.fuelType,
          route.year,
          route.ghgIntensity,
          route.fuelConsumption,
          route.distance,
          route.totalEmissions,
          route.isBaseline
        ]
      );
    }
  }

  const complianceCount = await connectionPool.query(
    "SELECT COUNT(*)::int AS count FROM compliance_records"
  );
  if (complianceCount.rows[0].count === 0) {
    const records = await readJsonFile<ComplianceRecord[]>("compliance.json", []);
    for (const record of records) {
      await connectionPool.query(
        "INSERT INTO compliance_records (route_id, year, cb) VALUES ($1, $2, $3)",
        [record.routeId, record.year, record.cb]
      );
    }
  }

  const bankTxCount = await connectionPool.query(
    "SELECT COUNT(*)::int AS count FROM bank_transactions"
  );
  if (bankTxCount.rows[0].count === 0) {
    const snapshot = await readJsonFile<BankSnapshot>("banking.json", {
      balance: 0,
      transactions: []
    });
    for (const transaction of snapshot.transactions) {
      await insertBankTransaction(transaction);
    }
    await connectionPool.query(
      "INSERT INTO bank_snapshot (id, balance) VALUES (1, $1) ON CONFLICT (id) DO NOTHING",
      [snapshot.balance]
    );
  }

  const poolsCount = await connectionPool.query("SELECT COUNT(*)::int AS count FROM pools");
  if (poolsCount.rows[0].count === 0) {
    const pools = await readJsonFile<CompliancePool[]>("pools.json", []);
    for (const pool of pools) {
      await connectionPool.query(
        "INSERT INTO pools (id, year, created_at) VALUES ($1, $2, $3)",
        [pool.id, pool.year, pool.createdAt]
      );
      for (const member of pool.members) {
        await connectionPool.query(
          `INSERT INTO pool_members (pool_id, route_id, year, cb_before, cb_after)
           VALUES ($1, $2, $3, $4, $5)`,
          [pool.id, member.routeId, member.year, member.cb_before, member.cb_after]
        );
      }
    }
  }

  await connectionPool.query(
    "INSERT INTO bank_snapshot (id, balance) VALUES (1, 0) ON CONFLICT (id) DO NOTHING"
  );
}

async function insertBankTransaction(transaction: BankTransaction): Promise<void> {
  await connectionPool.query(
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

export { connectionPool };
