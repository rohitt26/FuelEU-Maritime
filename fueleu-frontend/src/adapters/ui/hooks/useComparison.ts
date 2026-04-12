import { useEffect, useState } from "react";
import { RouteApiAdapter } from "../../api/RouteApiAdapter";

const api = new RouteApiAdapter();

export const useComparison = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getComparison()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};