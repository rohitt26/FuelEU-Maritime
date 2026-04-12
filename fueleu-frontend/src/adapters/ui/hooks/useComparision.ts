import { useEffect, useState } from "react";
import { RouteApiAdapter } from "../../api/RouteApiAdapter";

const api = new RouteApiAdapter();

export const useComparison = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.getComparison().then(setData);
  }, []);

  return { data };
};