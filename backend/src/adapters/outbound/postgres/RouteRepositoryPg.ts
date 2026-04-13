import { Route } from "../../../core/domain/Route";
import { RouteRepository } from "../../../core/ports/RouteRepository";
import { connectionPool } from "../../../infrastructure/db";

export class RouteRepositoryPg implements RouteRepository {
  async getAll(): Promise<Route[]> {
    const result = await connectionPool.query(
      `SELECT
        route_id,
        vessel_type,
        fuel_type,
        year,
        ghg_intensity,
        fuel_consumption,
        distance,
        total_emissions,
        is_baseline
      FROM routes
      ORDER BY route_id, year`
    );

    return result.rows.map(row => ({
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: Number(row.year),
      ghgIntensity: Number(row.ghg_intensity),
      fuelConsumption: Number(row.fuel_consumption),
      distance: Number(row.distance),
      totalEmissions: Number(row.total_emissions),
      isBaseline: Boolean(row.is_baseline)
    }));
  }

  async saveAll(routes: Route[]): Promise<void> {
    const client = await connectionPool.connect();
    try {
      await client.query("BEGIN");
      await client.query("TRUNCATE TABLE routes");

      for (const route of routes) {
        await client.query(
          `INSERT INTO routes (
            route_id, vessel_type, fuel_type, year, ghg_intensity,
            fuel_consumption, distance, total_emissions, is_baseline
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            route.routeId,
            route.vesselType,
            route.fuelType,
            route.year,
            route.ghgIntensity,
            route.fuelConsumption,
            route.distance,
            route.totalEmissions,
            route.isBaseline
          ]
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
