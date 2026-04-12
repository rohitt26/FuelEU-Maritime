import fs from "fs/promises";
import path from "path";
import {
  BankingRepository,
  BankEntry
} from "../../../core/ports/BankingRepository";

const filePath = path.join(__dirname, "../../../data/banking.json");

export class BankingRepositoryFile implements BankingRepository {
  async getAll(): Promise<BankEntry[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]");
  }

  async saveAll(entries: BankEntry[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2));
  }

  async find(routeId: string, year: number) {
    const all = await this.getAll();
    return all.find(e => e.routeId === routeId && e.year === year) || null;
  }

  async upsert(entry: BankEntry): Promise<void> {
    const all = await this.getAll();

    const index = all.findIndex(
      e => e.routeId === entry.routeId && e.year === entry.year
    );

    if (index >= 0) {
      all[index] = entry;
    } else {
      all.push(entry);
    }

    await this.saveAll(all);
  }
}