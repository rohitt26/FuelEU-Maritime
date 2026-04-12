import { ComplianceRepository } from "../ports/ComplianceRepository";
import { BankingRepository } from "../ports/BankingRepository";

export class BankSurplus {
  constructor(
    private complianceRepo: ComplianceRepository,
    private bankingRepo: BankingRepository
  ) {}

  async execute(routeId: string, year: number) {
    const cbRecord = await this.complianceRepo.find(routeId, year);

    if (!cbRecord) {
      throw new Error("CB not computed yet");
    }

    if (cbRecord.cb <= 0) {
      throw new Error("Cannot bank non-positive CB");
    }

    const existing = await this.bankingRepo.find(routeId, year);

    const newAmount = (existing?.amount || 0) + cbRecord.cb;

    await this.bankingRepo.upsert({
      routeId,
      year,
      amount: newAmount
    });

    return {
      message: "Surplus banked",
      banked: cbRecord.cb,
      totalBanked: newAmount
    };
  }
}