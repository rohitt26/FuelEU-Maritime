import { RouteRepository } from "../ports/RouteRepository";

export class GetRoutes {
  constructor(private repo: RouteRepository) {}

  async execute() {
    return this.repo.getAll();
  }
}