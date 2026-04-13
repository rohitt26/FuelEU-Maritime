import { useEffect, useState } from "react";
import { RouteApiAdapter } from "../../api/RouteApiAdapter";
import type { Route } from "../../../core/domain/Route";

const api = new RouteApiAdapter();

export const useComparison = () => {
  const [data, setData] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getComparison()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
