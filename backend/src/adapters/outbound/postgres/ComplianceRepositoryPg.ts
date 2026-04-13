import {
  ComplianceRecord,
  ComplianceRepository
} from "../../../core/ports/ComplianceRepository";
import { connectionPool } from "../../../infrastructure/db";

export class ComplianceRepositoryPg implements ComplianceRepository {
  async save(record: ComplianceRecord): Promise<void> {
    await connectionPool.query(
      `INSERT INTO compliance_records (route_id, year, cb)
       VALUES ($1, $2, $3)
       ON CONFLICT (route_id, year)
       DO UPDATE SET cb = EXCLUDED.cb`,
      [record.routeId, record.year, record.cb]
    );
  }

  async find(routeId: string, year: number): Promise<ComplianceRecord | null> {
    const result = await connectionPool.query(
      "SELECT route_id, year, cb FROM compliance_records WHERE route_id = $1 AND year = $2",
      [routeId, year]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      routeId: result.rows[0].route_id,
      year: Number(result.rows[0].year),
      cb: Number(result.rows[0].cb)
    };
  }

  async getAll(): Promise<ComplianceRecord[]> {
    const result = await connectionPool.query(
      "SELECT route_id, year, cb FROM compliance_records ORDER BY route_id, year"
    );
    return result.rows.map(row => ({
      routeId: row.route_id,
      year: Number(row.year),
      cb: Number(row.cb)
    }));
  }
}
