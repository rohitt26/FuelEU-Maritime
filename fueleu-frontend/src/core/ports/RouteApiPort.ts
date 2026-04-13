import type { Route } from "../domain/Route";

export interface RouteApiPort {
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<Route[]>;
}
