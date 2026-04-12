import { API_URL } from "../../shared/config";
import type { RouteApiPort } from "../../core/ports/RouteApiPort";
import type { Route } from "../../core/domain/Route";

export class RouteApiAdapter implements RouteApiPort {
  async getRoutes(): Promise<Route[]> {
    const res = await fetch(`${API_URL}/routes`);
    return res.json();
  }

  async setBaseline(routeId: string): Promise<void> {
    await fetch(`${API_URL}/routes/${routeId}/baseline`, {
      method: "POST",
    });
  }

  async getComparison() {
    const res = await fetch(`${API_URL}/routes/comparison`);
    return res.json();
  }
}