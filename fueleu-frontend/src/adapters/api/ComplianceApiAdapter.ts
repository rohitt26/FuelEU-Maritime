import { API_URL } from "../../shared/config";
import type { ComplianceApiPort } from "../../core/ports/ComplianceApiPort";
import type {
  AdjustedComplianceBalance,
  ApplyBankedResult,
  BankRecord,
  BankSurplusResult,
  ComplianceBalance,
  Pool,
} from "../../core/domain/Compliance";

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T | { error?: string };

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? data.error || "Request failed"
        : "Request failed";

    throw new Error(message);
  }

  return data as T;
};

export class ComplianceApiAdapter implements ComplianceApiPort {
  async getComplianceBalance(
    routeId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const response = await fetch(
      `${API_URL}/compliance/cb?routeId=${routeId}&year=${year}`
    );

    return parseResponse<ComplianceBalance>(response);
  }

  async getComplianceBalances(): Promise<ComplianceBalance[]> {
    const response = await fetch(`${API_URL}/compliance/records`);
    return parseResponse<ComplianceBalance[]>(response);
  }

  async calculateComplianceBalance(
    routeId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const response = await fetch(`${API_URL}/compliance/cb`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, year }),
    });

    return parseResponse<ComplianceBalance>(response);
  }

  async getAdjustedComplianceBalance(
    routeId: string,
    year: number
  ): Promise<AdjustedComplianceBalance> {
    const response = await fetch(
      `${API_URL}/compliance/adjusted-cb?routeId=${routeId}&year=${year}`
    );

    return parseResponse<AdjustedComplianceBalance>(response);
  }

  async getBankRecord(_routeId: string, _year: number): Promise<BankRecord> {
    const response = await fetch(`${API_URL}/banking/records`);

    return parseResponse<BankRecord>(response);
  }

  async bankSurplus(routeId: string, year: number): Promise<BankSurplusResult> {
    const response = await fetch(`${API_URL}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, year }),
    });

    return parseResponse<BankSurplusResult>(response);
  }

  async applyBanked(
    routeId: string,
    year: number,
    amount: number
  ): Promise<ApplyBankedResult> {
    const response = await fetch(`${API_URL}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, year, amount }),
    });

    return parseResponse<ApplyBankedResult>(response);
  }

  async getPools(): Promise<Pool[]> {
    const response = await fetch(`${API_URL}/pools`);
    return parseResponse<Pool[]>(response);
  }

  async createPool(routeIds: string[], year: number): Promise<Pool> {
    const response = await fetch(`${API_URL}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeIds, year }),
    });

    return parseResponse<Pool>(response);
  }
}
