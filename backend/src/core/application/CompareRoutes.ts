import { RouteRepository } from "../ports/RouteRepository";

const TARGET = 89.3368;

export class CompareRoutes {
  constructor(private repo: RouteRepository) {}

  async execute() {
    const routes = await this.repo.getAll();

    const baseline = routes.find(r => r.isBaseline);
    if (!baseline) {
      throw new Error("No baseline set");
    }

    return routes.map(route => {
      const percentDiff =
        ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

      return {
        ...route,
        percentDiff: Number(percentDiff.toFixed(2)),
        compliant: route.ghgIntensity <= TARGET
      };
    });
  }
}