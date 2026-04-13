import { Pool, PoolRepository } from "../../../core/ports/PoolRepository";
import { connectionPool } from "../../../infrastructure/db";

export class PoolRepositoryPg implements PoolRepository {
  async getAll(): Promise<Pool[]> {
    const poolsResult = await connectionPool.query(
      "SELECT id, year, created_at FROM pools ORDER BY created_at DESC"
    );
    const membersResult = await connectionPool.query(
      "SELECT pool_id, route_id, year, cb_before, cb_after FROM pool_members"
    );

    return poolsResult.rows.map(poolRow => ({
      id: poolRow.id,
      year: Number(poolRow.year),
      createdAt: new Date(poolRow.created_at).toISOString(),
      members: membersResult.rows
        .filter(member => member.pool_id === poolRow.id)
        .map(member => ({
          routeId: member.route_id,
          year: Number(member.year),
          cb_before: Number(member.cb_before),
          cb_after: Number(member.cb_after)
        }))
    }));
  }

  async save(pool: Pool): Promise<void> {
    const client = await connectionPool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO pools (id, year, created_at) VALUES ($1, $2, $3)",
        [pool.id, pool.year, pool.createdAt]
      );

      for (const member of pool.members) {
        await client.query(
          `INSERT INTO pool_members (pool_id, route_id, year, cb_before, cb_after)
           VALUES ($1, $2, $3, $4, $5)`,
          [pool.id, member.routeId, member.year, member.cb_before, member.cb_after]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
