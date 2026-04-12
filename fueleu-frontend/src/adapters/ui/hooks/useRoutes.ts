import { useEffect, useState } from "react";
import type { Route } from "../../../core/domain/Route";
import { RouteApiAdapter } from "../../api/RouteApiAdapter";

const api = new RouteApiAdapter();

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    api.getRoutes().then(setRoutes);
  }, []);

  return { routes, setRoutes };
};