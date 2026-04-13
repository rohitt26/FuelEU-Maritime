import { describe, expect, it, vi } from "vitest";
import { CompareRoutes } from "../../src/core/application/CompareRoutes";
import { ComputeCB } from "../../src/core/application/ComputeCB";
import { BankSurplus } from "../../src/core/application/BankSurplus";
import { ApplyBanked } from "../../src/core/application/ApplyBanked";
import { CreatePool } from "../../src/core/application/CreatePool";
import { RouteRepository } from "../../src/core/ports/RouteRepository";
import {
  ComplianceRecord,
  ComplianceRepository
} from "../../src/core/ports/ComplianceRepository";
import {
  BankingRepository,
  BankSnapshot
} from "../../src/core/ports/BankingRepository";
import { Pool, PoolRepository } from "../../src/core/ports/PoolRepository";

describe("ComputeComparison (CompareRoutes)", () => {
  it("computes percent difference and compliance flag", async () => {
    const routeRepo: RouteRepository = {
      getAll: vi.fn().mockResolvedValue([
        {
          routeId: "BASE",
          vesselType: "A",
          fuelType: "B",
          year: 2025,
          ghgIntensity: 90,
          fuelConsumption: 1,
          distance: 1,
          totalEmissions: 1,
          isBaseline: true
        },
        {
          routeId: "R2",
          vesselType: "A",
          fuelType: "B",
          year: 2025,
          ghgIntensity: 88,
          fuelConsumption: 1,
          distance: 1,
          totalEmissions: 1,
          isBaseline: false
        }
      ]),
      saveAll: vi.fn()
    };

    const result = await new CompareRoutes(routeRepo).execute();
    expect(result[1].percentDiff).toBeCloseTo(-2.22, 2);
    expect(result[1].compliant).toBe(true);
  });
});

describe("ComputeCB", () => {
  it("computes and stores CB when absent", async () => {
    const routeRepo: RouteRepository = {
      getAll: vi.fn().mockResolvedValue([
        {
          routeId: "R1",
          vesselType: "Container",
          fuelType: "LNG",
          year: 2025,
          ghgIntensity: 80,
          fuelConsumption: 10,
          distance: 100,
          totalEmissions: 1000,
          isBaseline: false
        }
      ]),
      saveAll: vi.fn()
    };

    const complianceRepo: ComplianceRepository = {
      find: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      getAll: vi.fn().mockResolvedValue([])
    };

    const result = await new ComputeCB(routeRepo, complianceRepo).execute(
      "R1",
      2025
    );

    expect(result.cb).toBeCloseTo(3828088, 0);
    expect(complianceRepo.save).toHaveBeenCalledWith(result);
  });
});

describe("BankSurplus", () => {
  it("throws for negative CB (edge case)", async () => {
    const complianceRepo: ComplianceRepository = {
      find: vi.fn().mockResolvedValue({
        routeId: "R1",
        year: 2025,
        cb: -10
      } satisfies ComplianceRecord),
      save: vi.fn(),
      getAll: vi.fn()
    };

    const bankingRepo: BankingRepository = {
      getSnapshot: vi.fn().mockResolvedValue({ balance: 0, transactions: [] }),
      saveSnapshot: vi.fn(),
      hasBanked: vi.fn().mockResolvedValue(false),
      addTransaction: vi.fn()
    };

    await expect(new BankSurplus(complianceRepo, bankingRepo).execute("R1", 2025))
      .rejects
      .toThrow("Cannot bank non-positive CB");
  });
});

describe("ApplyBanked", () => {
  it("prevents over-apply bank (edge case)", async () => {
    const complianceRepo: ComplianceRepository = {
      find: vi.fn().mockResolvedValue({
        routeId: "R1",
        year: 2025,
        cb: -50
      } satisfies ComplianceRecord),
      save: vi.fn(),
      getAll: vi.fn()
    };

    const snapshot: BankSnapshot = { balance: 20, transactions: [] };
    const bankingRepo: BankingRepository = {
      getSnapshot: vi.fn().mockResolvedValue(snapshot),
      saveSnapshot: vi.fn(),
      hasBanked: vi.fn().mockResolvedValue(false),
      addTransaction: vi.fn()
    };

    await expect(
      new ApplyBanked(complianceRepo, bankingRepo).execute("R1", 2025, 30)
    ).rejects.toThrow("Amount exceeds available banked surplus");
  });
});

describe("CreatePool", () => {
  it("rejects invalid pool with negative total CB (edge case)", async () => {
    const complianceRepo: ComplianceRepository = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ routeId: "A", year: 2025, cb: -100 })
        .mockResolvedValueOnce({ routeId: "B", year: 2025, cb: 40 }),
      save: vi.fn(),
      getAll: vi.fn()
    };

    const poolRepo: PoolRepository = {
      getAll: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined)
    };

    await expect(
      new CreatePool(complianceRepo, poolRepo).execute(["A", "B"], 2025)
    ).rejects.toThrow("Pool invalid: total CB is negative");
  });

  it("creates pool when total CB is non-negative", async () => {
    const complianceRepo: ComplianceRepository = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ routeId: "A", year: 2025, cb: -50 })
        .mockResolvedValueOnce({ routeId: "B", year: 2025, cb: 70 }),
      save: vi.fn(),
      getAll: vi.fn()
    };

    const poolRepo: PoolRepository = {
      getAll: vi.fn().mockResolvedValue([] as Pool[]),
      save: vi.fn().mockResolvedValue(undefined)
    };

    const pool = await new CreatePool(complianceRepo, poolRepo).execute(
      ["A", "B"],
      2025
    );

    expect(pool.members.find(m => m.routeId === "A")?.cb_after).toBe(0);
    expect(poolRepo.save).toHaveBeenCalledOnce();
  });
});
