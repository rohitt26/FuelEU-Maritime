import fs from "fs/promises";
import path from "path";
import { PoolRepository, Pool } from "../../../core/ports/PoolRepository";

const filePath = path.join(__dirname, "../../../data/pools.json");

export class PoolRepositoryFile implements PoolRepository {
  async getAll(): Promise<Pool[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]");
  }

  async save(pool: Pool): Promise<void> {
    const all = await this.getAll();
    all.push(pool);
    await fs.writeFile(filePath, JSON.stringify(all, null, 2));
  }
}