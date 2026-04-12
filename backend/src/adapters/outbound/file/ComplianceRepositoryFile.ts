import fs from "fs/promises";
import path from "path";
import {
  ComplianceRepository,
  ComplianceRecord
} from "../../../core/ports/ComplianceRepository";

const filePath = path.join(__dirname, "../../../data/compliance.json");

export class ComplianceRepositoryFile implements ComplianceRepository {
  async getAll(): Promise<ComplianceRecord[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]");
  }

  async save(record: ComplianceRecord): Promise<void> {
    const all = await this.getAll();

    const existingIndex = all.findIndex(
      r => r.routeId === record.routeId && r.year === record.year
    );

    if (existingIndex >= 0) {
      all[existingIndex] = record;
    } else {
      all.push(record);
    }

    await fs.writeFile(filePath, JSON.stringify(all, null, 2));
  }

  async find(routeId: string, year: number) {
    const all = await this.getAll();
    return all.find(r => r.routeId === routeId && r.year === year) || null;
  }
}