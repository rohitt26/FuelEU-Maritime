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

    const alreadyBanked = await this.bankingRepo.hasBanked(routeId, year);

    if (alreadyBanked) {
      throw new Error("Surplus already banked for this route and year");
    }

    const snapshot = await this.bankingRepo.getSnapshot();
    const totalBanked = Number((snapshot.balance + cbRecord.cb).toFixed(2));

    await this.bankingRepo.addTransaction({
      routeId,
      year,
      amount: cbRecord.cb,
      type: "BANK",
      balanceAfter: totalBanked
    });

    return {
      message: "Surplus banked successfully",
      banked: cbRecord.cb,
      totalBanked
    };
  }
}
