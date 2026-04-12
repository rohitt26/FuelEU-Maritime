import { RouteRepository } from "../ports/RouteRepository";

export class SetBaseline {
  constructor(private repo: RouteRepository) {}

  async execute(routeId: string) {
    const routes = await this.repo.getAll();

    const updated = routes.map(r => ({
      ...r,
      isBaseline: r.routeId === routeId
    }));

    await this.repo.saveAll(updated);
  }
}