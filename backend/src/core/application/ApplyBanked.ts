import { ComplianceRepository } from "../ports/ComplianceRepository";
import { BankingRepository } from "../ports/BankingRepository";

export class ApplyBanked {
  constructor(
    private complianceRepo: ComplianceRepository,
    private bankingRepo: BankingRepository
  ) {}

  async execute(routeId: string, year: number, amount: number) {
    const cbRecord = await this.complianceRepo.find(routeId, year);

    if (!cbRecord) {
      throw new Error("CB not computed yet");
    }

    if (cbRecord.cb >= 0) {
      throw new Error("No deficit to apply banking");
    }

    const bank = await this.bankingRepo.getSnapshot();

    if (bank.balance <= 0) {
      throw new Error("No banked surplus available");
    }

    if (amount > bank.balance) {
      throw new Error("Amount exceeds available banked surplus");
    }

    const deficit = Math.abs(cbRecord.cb);

    const applied = Math.min(amount, deficit);

    const newCB = cbRecord.cb + applied; // reduces deficit
    const remainingBank = Number((bank.balance - applied).toFixed(2));

    // update CB
    await this.complianceRepo.save({
      routeId,
      year,
      cb: newCB
    });

    await this.bankingRepo.addTransaction({
      routeId,
      year,
      amount: applied,
      type: "APPLY",
      balanceAfter: remainingBank
    });

    return {
      applied,
      cb_before: cbRecord.cb,
      cb_after: newCB,
      remainingBank
    };
  }
}
