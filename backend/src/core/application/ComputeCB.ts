import { RouteRepository } from "../ports/RouteRepository";
import {
  ComplianceRepository
} from "../ports/ComplianceRepository";

const TARGET = 89.3368;
const ENERGY_FACTOR = 41000;

export class ComputeCB {
  constructor(
    private routeRepo: RouteRepository,
    private complianceRepo: ComplianceRepository
  ) {}

  async execute(routeId: string, year: number) {
    const routes = await this.routeRepo.getAll();

    const route = routes.find(
      r => r.routeId === routeId && r.year === year
    );

    if (!route) {
      throw new Error("Route not found");
    }

    const energy = route.fuelConsumption * ENERGY_FACTOR;

    const cb = (TARGET - route.ghgIntensity) * energy;

    const record = {
      routeId,
      year,
      cb: Number(cb.toFixed(2))
    };

    await this.complianceRepo.save(record);

    return record;
  }
}