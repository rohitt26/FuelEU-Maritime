import { BankingRepository } from "../ports/BankingRepository";

export class GetBankRecords {
  constructor(private repo: BankingRepository) {}

  async execute() {
    return this.repo.getSnapshot();
  }
}
