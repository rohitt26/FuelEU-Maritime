import fs from "fs/promises";
import path from "path";
import { Route } from "../../../core/domain/Route";
import { RouteRepository } from "../../../core/ports/RouteRepository";

const filePath = path.join(__dirname, "../../../data/routes.json");

export class RouteRepositoryFile implements RouteRepository {
  async getAll(): Promise<Route[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async saveAll(routes: Route[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(routes, null, 2));
  }
}