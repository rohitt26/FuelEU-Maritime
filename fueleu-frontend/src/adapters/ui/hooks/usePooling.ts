import { useEffect, useState } from "react";
import { API_URL } from "../../../shared/config";

export const usePooling = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const routesRes = await fetch(`${API_URL}/routes`).then((r) =>
      r.json()
    );

    const poolsRes = await fetch(`${API_URL}/pools`).then((r) =>
      r.json()
    );

    setRoutes(routesRes);
    setPools(poolsRes);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { routes, pools, loading, refetch: fetchData };
};