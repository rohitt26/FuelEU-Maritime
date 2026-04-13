import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/infrastructure/app";
import { createComplianceController } from "../../src/adapters/inbound/http/compliance.controller";
import { createBankingController } from "../../src/adapters/inbound/http/banking.controller";
import { createPoolController } from "../../src/adapters/inbound/http/pool.controller";
import { createRoutesController } from "../../src/adapters/inbound/http/routes.controller";
import { RouteRepository } from "../../src/core/ports/RouteRepository";
import {
  ComplianceRecord,
  ComplianceRepository
} from "../../src/core/ports/ComplianceRepository";
import {
  BankSnapshot,
  BankingRepository
} from "../../src/core/ports/BankingRepository";
import { Pool, PoolRepository } from "../../src/core/ports/PoolRepository";

function setupTestApp() {
  const routes = [
    {
      routeId: "A",
      vesselType: "Container",
      fuelType: "LNG",
      year: 2025,
      ghgIntensity: 90,
      fuelConsumption: 10,
      distance: 100,
      totalEmissions: 1000,
      isBaseline: true
    },
    {
      routeId: "B",
      vesselType: "Container",
      fuelType: "LNG",
      year: 2025,
      ghgIntensity: 70,
      fuelConsumption: 10,
      distance: 100,
      totalEmissions: 1000,
      isBaseline: false
    }
  ];

  const routeRepo: RouteRepository = {
    getAll: async () => routes,
    saveAll: async next => {
      routes.splice(0, routes.length, ...next);
    }
  };

  const records = new Map<string, ComplianceRecord>([
    ["A-2025", { routeId: "A", year: 2025, cb: 50 }],
    ["B-2025", { routeId: "B", year: 2025, cb: -30 }]
  ]);
  const complianceRepo: ComplianceRepository = {
    save: async record => {
      records.set(`${record.routeId}-${record.year}`, record);
    },
    find: async (routeId, year) => records.get(`${routeId}-${year}`) ?? null,
    getAll: async () => Array.from(records.values())
  };

  const snapshot: BankSnapshot = { balance: 100, transactions: [] };
  const bankingRepo: BankingRepository = {
    getSnapshot: async () => snapshot,
    saveSnapshot: async next => {
      snapshot.balance = next.balance;
      snapshot.transactions = next.transactions;
    },
    hasBanked: async () => false,
    addTransaction: async tx => {
      snapshot.balance = tx.balanceAfter;
      return snapshot;
    }
  };

  const pools: Pool[] = [];
  const poolRepo: PoolRepository = {
    getAll: async () => pools,
    save: async pool => {
      pools.unshift(pool);
    }
  };

  const app = createApp({
    compliance: createComplianceController({ routeRepo, complianceRepo }),
    banking: createBankingController({ bankingRepo, complianceRepo }),
    pools: createPoolController({ poolRepo, complianceRepo }),
    routes: createRoutesController({ repo: routeRepo })
  });

  return { app };
}

describe("HTTP endpoints via Supertest", () => {
  it("returns route comparison", async () => {
    const { app } = setupTestApp();
    const res = await request(app).get("/routes/comparison");
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ routeId: "A" });
  });

  it("applies banked surplus to deficit", async () => {
    const { app } = setupTestApp();
    const res = await request(app).post("/banking/apply").send({
      routeId: "B",
      year: 2025,
      amount: 20
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ applied: 20, cb_after: -10 });
  });

  it("creates pool from valid routes", async () => {
    const { app } = setupTestApp();
    const res = await request(app).post("/pools").send({
      routeIds: ["A", "B"],
      year: 2025
    });
    expect(res.status).toBe(200);
    expect(res.body.members).toHaveLength(2);
  });
});
