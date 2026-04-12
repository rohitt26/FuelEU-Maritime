import { Route } from "../domain/Route";

export interface RouteRepository {
  getAll(): Promise<Route[]>;
  saveAll(routes: Route[]): Promise<void>;
}