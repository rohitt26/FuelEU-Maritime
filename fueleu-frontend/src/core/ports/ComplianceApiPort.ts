import type {
  AdjustedComplianceBalance,
  ApplyBankedResult,
  BankRecord,
  BankSurplusResult,
  ComplianceBalance,
  Pool,
} from "../domain/Compliance";

export interface ComplianceApiPort {
  getComplianceBalance(routeId: string, year: number): Promise<ComplianceBalance>;
  getComplianceBalances(): Promise<ComplianceBalance[]>;
  calculateComplianceBalance(
    routeId: string,
    year: number
  ): Promise<ComplianceBalance>;
  getAdjustedComplianceBalance(
    routeId: string,
    year: number
  ): Promise<AdjustedComplianceBalance>;
  getBankRecord(routeId: string, year: number): Promise<BankRecord>;
  bankSurplus(routeId: string, year: number): Promise<BankSurplusResult>;
  applyBanked(
    routeId: string,
    year: number,
    amount: number
  ): Promise<ApplyBankedResult>;
  getPools(): Promise<Pool[]>;
  createPool(routeIds: string[], year: number): Promise<Pool>;
}
