import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();
const readFileMock = vi.fn();

vi.mock("pg", () => {
  class MockPool {
    query = queryMock;
  }
  return { Pool: MockPool };
});

vi.mock("fs/promises", () => ({
  default: { readFile: readFileMock }
}));

describe("Data setup (migrations + seeds)", () => {
  beforeEach(() => {
    queryMock.mockReset();
    readFileMock.mockReset();
  });

  it("creates schema tables and loads seed data", async () => {
    queryMock.mockImplementation(async (sql: string) => {
      if (sql.includes("FROM routes")) return { rows: [{ count: 0 }] };
      if (sql.includes("FROM compliance_records")) return { rows: [{ count: 0 }] };
      if (sql.includes("FROM bank_transactions")) return { rows: [{ count: 0 }] };
      if (sql.includes("FROM pools")) return { rows: [{ count: 0 }] };
      return { rows: [] };
    });

    readFileMock.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("routes.json")) {
        return JSON.stringify([
          {
            routeId: "R1",
            vesselType: "Container",
            fuelType: "LNG",
            year: 2025,
            ghgIntensity: 80,
            fuelConsumption: 10,
            distance: 200,
            totalEmissions: 500,
            isBaseline: true
          }
        ]);
      }
      if (filePath.endsWith("compliance.json")) {
        return JSON.stringify([{ routeId: "R1", year: 2025, cb: 12 }]);
      }
      if (filePath.endsWith("banking.json")) {
        return JSON.stringify({ balance: 10, transactions: [] });
      }
      if (filePath.endsWith("pools.json")) {
        return JSON.stringify([]);
      }
      throw new Error("not found");
    });

    const { initDatabase } = await import("../../src/infrastructure/db");
    await initDatabase();

    const sqlCalls = queryMock.mock.calls.map(call => String(call[0]));
    expect(sqlCalls.some(sql => sql.includes("CREATE TABLE IF NOT EXISTS routes"))).toBe(true);
    expect(sqlCalls.some(sql => sql.includes("CREATE TABLE IF NOT EXISTS compliance_records"))).toBe(true);
    expect(sqlCalls.some(sql => sql.includes("INSERT INTO routes"))).toBe(true);
    expect(sqlCalls.some(sql => sql.includes("INSERT INTO compliance_records"))).toBe(true);
  });
});
