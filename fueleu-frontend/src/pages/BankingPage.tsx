import { useState } from "react";
import { useBanking } from "../adapters/ui/hooks/useBanking";
import { useRoutes } from "../adapters/ui/hooks/useRoutes";
import {
  canApplyBanked,
  canBankSurplus,
  getBankingKpis,
} from "../core/application/usecases/banking";

export const BankingPage = () => {
  const { routes } = useRoutes();
  const {
    snapshot,
    lastApplication,
    error,
    success,
    loading,
    fetchData,
    bankSurplus,
    applyBanked,
    clearMessages,
  } = useBanking();

  const [routeId, setRouteId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [calculated, setCalculated] = useState(false);

  const selectedRoute = routes.find((route) => route.routeId === routeId);
  const year = selectedRoute?.year ?? new Date().getFullYear();
  const kpis = getBankingKpis(snapshot, lastApplication);
  const hasSelection = Boolean(selectedRoute);
  const canBank = canBankSurplus(snapshot);
  const canApply = canApplyBanked(snapshot, amount);

  const handleCalculate = async () => {
    if (!selectedRoute) {
      return;
    }

    await fetchData(routeId, year);
    setCalculated(true);
  };

  const handleRouteChange = (nextRouteId: string) => {
    setRouteId(nextRouteId);
    setAmount(0);
    setCalculated(false);
    clearMessages();
  };

  const handleBank = async () => {
    if (!selectedRoute) {
      return;
    }

    await bankSurplus(routeId, year);
  };

  const handleApply = async () => {
    if (!selectedRoute) {
      return;
    }

    await applyBanked(routeId, year, amount);
    setAmount(0);
  };

  return (
    <div className="p-6 space-y-6">
      {error && <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>}
      {success && (
        <div className="rounded bg-green-100 p-3 text-green-700">{success}</div>
      )}

      <h1 className="text-xl font-bold">Banking Dashboard</h1>

      <div className="space-y-3 rounded bg-white p-4 shadow">
        <h2 className="font-semibold">Select Ship</h2>

        <div className="flex flex-col gap-3 md:flex-row">
          <select
            className="rounded border p-2 md:min-w-64"
            value={routeId}
            onChange={(event) => handleRouteChange(event.target.value)}
          >
            <option value="">Choose a route</option>
            {routes.map((route) => (
              <option key={route.routeId} value={route.routeId}>
                {route.routeId} | {route.vesselType} | {route.year}
              </option>
            ))}
          </select>

          <div className="rounded border bg-slate-50 p-2 text-slate-600 md:w-32">
            {selectedRoute ? year : "Year"}
          </div>

          <button
            onClick={handleCalculate}
            disabled={!hasSelection || loading}
            className={`rounded px-4 py-2 text-white ${
              hasSelection && !loading ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            {loading ? "Working..." : "Calculate CB"}
          </button>
        </div>

        {selectedRoute && (
          <p className="text-sm text-slate-600">
            Fuel: {selectedRoute.fuelType} | GHG intensity: {selectedRoute.ghgIntensity}
          </p>
        )}
      </div>

      {loading && <div className="text-slate-600">Loading data...</div>}

      {calculated && snapshot && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded bg-white p-4 shadow">
              <p className="text-gray-500">CB Before</p>
              <p className="text-xl font-bold">{kpis.cbBefore.toFixed(2)}</p>
            </div>

            <div className="rounded bg-white p-4 shadow">
              <p className="text-gray-500">Applied</p>
              <p className="text-xl font-bold">{kpis.applied.toFixed(2)}</p>
            </div>

            <div className="rounded bg-white p-4 shadow">
              <p className="text-gray-500">CB After</p>
              <p className="text-xl font-bold">{kpis.cbAfter.toFixed(2)}</p>
            </div>

            <div className="rounded bg-white p-4 shadow">
              <p className="text-gray-500">Banked Available</p>
              <p className="text-xl font-bold">{snapshot.bank.amount.toFixed(2)}</p>
            </div>

            <div className="rounded bg-white p-4 shadow">
              <p className="text-gray-500">Current Status</p>
              <p
                className={
                  snapshot.cb.cb > 0
                    ? "font-semibold text-green-600"
                    : "font-semibold text-red-600"
                }
              >
                {snapshot.cb.cb > 0 ? "Surplus" : "Deficit"}
              </p>
            </div>

            <div className="rounded bg-white p-4 shadow">
              <p className="text-gray-500">Route / Year</p>
              <p className="text-xl font-bold">
                {snapshot.cb.routeId} / {snapshot.cb.year}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded bg-white p-4 shadow">
            <h2 className="font-semibold">Actions</h2>

            <button
              onClick={handleBank}
              disabled={!canBank || loading}
              className={`rounded px-4 py-2 text-white ${
                canBank && !loading ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              Bank Surplus
            </button>

            {!canBank && snapshot.cb.cb <= 0 && (
              <p className="text-sm text-slate-500">
                Banking is disabled because the compliance balance is not positive.
              </p>
            )}

            {!canBank && snapshot.cb.cb > 0 && snapshot.bank.amount > 0 && (
              <p className="text-sm text-slate-500">
                This route already has banked surplus. Use Apply Bank to consume it.
              </p>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="number"
                className="w-40 rounded border p-2"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                placeholder="Apply amount"
              />

              <button
                onClick={handleApply}
                disabled={!canApply || loading}
                className={`rounded px-4 py-2 text-white ${
                  canApply && !loading ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                Apply Bank
              </button>
            </div>

            {!canApply && (
              <p className="text-sm text-slate-500">
                Apply is available only when the route has a deficit, banked surplus exists,
                and the amount does not exceed the banked balance.
              </p>
            )}
          </div>

          <div className="rounded bg-white p-4 text-sm text-gray-600 shadow">
            <p>CB Before: {kpis.cbBefore.toFixed(2)}</p>
            <p>Applied: {kpis.applied.toFixed(2)}</p>
            <p>CB After: {kpis.cbAfter.toFixed(2)}</p>
            <p>Banked Available: {snapshot.bank.amount.toFixed(2)}</p>
          </div>
        </>
      )}
    </div>
  );
};
