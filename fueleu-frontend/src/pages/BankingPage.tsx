import { useState } from "react";
import { API_URL } from "../shared/config";
import { useBanking } from "../adapters/ui/hooks/useBanking";

export const BankingPage = () => {
  const routeId = "R002"; // you can later make dropdown
  const year = 2024;

  const { cb, bank, loading, refetch } = useBanking(routeId, year);

  const [amount, setAmount] = useState<number>(0);

  if (loading) return <div className="p-6">Loading...</div>;

  const bankSurplus = async () => {
    await fetch(`${API_URL}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, year }),
    });

    refetch();
  };

  const applyBank = async () => {
    await fetch(`${API_URL}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, year, amount }),
    });

    setAmount(0);
    refetch();
  };

  const hasPositiveCB = cb?.cb > 0;
  const hasBank = bank?.amount > 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Banking Dashboard</h1>

      {/* 📊 KPI CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-500">Current CB</p>
          <p className="text-xl font-bold">{cb?.cb?.toFixed(2)}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-500">Banked Amount</p>
          <p className="text-xl font-bold">
            {bank?.amount?.toFixed(2) || 0}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-500">Status</p>
          <p className={hasPositiveCB ? "text-green-600" : "text-red-600"}>
            {hasPositiveCB ? "Surplus" : "Deficit"}
          </p>
        </div>
      </div>

      {/* ⚙️ ACTIONS */}
      <div className="bg-white p-4 shadow rounded space-y-4">
        <h2 className="font-semibold">Actions</h2>

        {/* BANK SURPLUS */}
        <button
          disabled={!hasPositiveCB}
          onClick={bankSurplus}
          className={`px-4 py-2 rounded text-white ${
            hasPositiveCB ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          Bank Surplus
        </button>

        {/* APPLY BANK */}
        <div className="flex gap-2 items-center mt-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border p-2 rounded w-40"
            placeholder="Amount"
          />

          <button
            disabled={!hasBank || amount <= 0}
            onClick={applyBank}
            className={`px-4 py-2 rounded text-white ${
              hasBank && amount > 0 ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            Apply Bank
          </button>
        </div>
      </div>

      {/* 📉 WARNINGS */}
      <div className="text-sm text-gray-600">
        {!hasPositiveCB && <p>⚠️ No surplus available to bank</p>}
        {!hasBank && <p>⚠️ No banked surplus available</p>}
      </div>
    </div>
  );
};