import { useEffect, useState } from "react";
import { API_URL } from "../../../shared/config";

export const useBanking = (routeId: string, year: number) => {
  const [cb, setCb] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const cbRes = await fetch(
      `${API_URL}/compliance/cb?routeId=${routeId}&year=${year}`
    ).then((r) => r.json());

    const bankRes = await fetch(
      `${API_URL}/banking/records?routeId=${routeId}&year=${year}`
    ).then((r) => r.json());

    setCb(cbRes);
    setBank(bankRes);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [routeId, year]);

  return { cb, bank, loading, refetch: fetchData };
};