import { ComplianceRepository } from "../ports/ComplianceRepository";
import { BankingRepository } from "../ports/BankingRepository";

export class BankSurplus {
  constructor(
    private complianceRepo: ComplianceRepository,
    private bankingRepo: BankingRepository
  ) {}

  async execute(routeId: string, year: number) {
    // 1. Get CB
    const cbRecord = await this.complianceRepo.find(routeId, year);

    if (!cbRecord) {
      throw new Error("CB not computed yet");
    }

    if (cbRecord.cb <= 0) {
      throw new Error("Cannot bank non-positive CB");
    }

    // 2. Check existing bank record
    const existing = await this.bankingRepo.find(routeId, year);

    if (existing) {
      throw new Error(
        "Banking already exists for this route and year. Use apply instead."
      );
    }

    // 3. Create new bank entry
    await this.bankingRepo.upsert({
      routeId,
      year,
      amount: cbRecord.cb
    });

    return {
      message: "Surplus banked successfully",
      banked: cbRecord.cb,
      totalBanked: cbRecord.cb
    };
  }
}