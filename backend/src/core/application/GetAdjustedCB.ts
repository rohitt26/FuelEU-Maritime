import { ComplianceRepository } from "../ports/ComplianceRepository";

export class GetAdjustedCB {
  constructor(private complianceRepo: ComplianceRepository) {}

  async execute(routeId: string, year: number) {
    const record = await this.complianceRepo.find(routeId, year);

    if (!record) {
      throw new Error("CB not computed yet");
    }

    // Later: subtract applied banking
    return {
      ...record,
      adjustedCB: record.cb
    };
  }
}