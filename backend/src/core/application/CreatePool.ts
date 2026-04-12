import { ComplianceRepository } from "../ports/ComplianceRepository";
import { PoolRepository } from "../ports/PoolRepository";

export class CreatePool {
  constructor(
    private complianceRepo: ComplianceRepository,
    private poolRepo: PoolRepository
  ) {}

  async execute(routeIds: string[], year: number) {
    // 1. Fetch CBs
    const members = [];

    for (const routeId of routeIds) {
      const record = await this.complianceRepo.find(routeId, year);

      if (!record) {
        throw new Error(`CB not found for ${routeId}`);
      }

      members.push({
        routeId,
        year,
        cb_before: record.cb,
        cb_after: record.cb
      });
    }

    // 2. Validate total CB ≥ 0
    const totalCB = members.reduce((sum, m) => sum + m.cb_before, 0);

    if (totalCB < 0) {
      throw new Error("Pool invalid: total CB is negative");
    }

    // 3. Separate surplus and deficit
    const surplus = members
      .filter(m => m.cb_before > 0)
      .sort((a, b) => b.cb_before - a.cb_before);

    const deficit = members
      .filter(m => m.cb_before < 0)
      .sort((a, b) => a.cb_before - b.cb_before); // most negative first

    // 4. Greedy allocation
    for (const d of deficit) {
      let remainingDeficit = Math.abs(d.cb_after);

      for (const s of surplus) {
        if (remainingDeficit <= 0) break;

        const available = s.cb_after;

        if (available <= 0) continue;

        const transfer = Math.min(available, remainingDeficit);

        s.cb_after -= transfer;
        d.cb_after += transfer;

        remainingDeficit -= transfer;
      }
    }

    // 5. Validations

    for (const m of members) {
      // Deficit ship cannot be worse
      if (m.cb_before < 0 && m.cb_after < m.cb_before) {
        throw new Error(
          `Deficit ship ${m.routeId} became worse after pooling`
        );
      }

      // Surplus ship cannot go negative
      if (m.cb_before > 0 && m.cb_after < 0) {
        throw new Error(
          `Surplus ship ${m.routeId} became negative after pooling`
        );
      }
    }

    // 6. Save pool
    const pool = {
      id: `POOL-${Date.now()}`,
      year,
      members,
      createdAt: new Date().toISOString()
    };

    await this.poolRepo.save(pool);

    return pool;
  }
}