import { BankingRepository } from "../ports/BankingRepository";

export class GetBankRecords {
  constructor(private repo: BankingRepository) {}

  async execute(routeId: string, year: number) {
    const record = await this.repo.find(routeId, year);
    return record || { routeId, year, amount: 0 };
  }
}