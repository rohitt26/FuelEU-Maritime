import { PoolRepository } from "../ports/PoolRepository";

export class GetPools {
  constructor(private repo: PoolRepository) {}

  async execute() {
    return this.repo.getAll();
  }
}