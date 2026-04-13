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
    if (!selectedRoute) return;
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
    if (!selectedRoute) return;
    await bankSurplus(routeId, year);
  };

  const handleApply = async () => {
    if (!selectedRoute) return;
    await applyBanked(routeId, year, amount);
    setAmount(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-slate-900">
      {/* Notifications */}
      <div className="mb-8 space-y-2">
        {error && (
          <div className="border-l-4 border-black bg-slate-50 p-4 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="border-l-4 border-slate-400 bg-slate-50 p-4 text-sm font-medium uppercase tracking-wider">
            {success}
          </div>
        )}
      </div>

      <header className="mb-12 border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Maritime Operations</p>
          <h1 className="text-3xl font-light tracking-tight">Banking Dashboard</h1>
        </div>
        {selectedRoute && (
          <div className="text-right text-xs uppercase tracking-widest text-slate-500">
            {selectedRoute.fuelType} // {selectedRoute.ghgIntensity} GHGi
          </div>
        )}
      </header>

      {/* Control Panel */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest">Select Route</label>
            <select
              className="w-full bg-white border border-slate-300 rounded-none p-3 text-sm focus:outline-none focus:border-black transition-colors appearance-none"
              value={routeId}
              onChange={(event) => handleRouteChange(event.target.value)}
            >
              <option value="">Choose a route...</option>
              {routes.map((route) => (
                <option key={route.routeId} value={route.routeId}>
                  {route.routeId} — {route.vesselType} ({route.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest">Year</label>
            <div className="p-3 border border-slate-200 bg-slate-50 text-sm text-slate-400">
              {selectedRoute ? year : "----"}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!hasSelection || loading}
            className="group relative h-[46px] border border-black bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-20 disabled:hover:bg-black disabled:hover:text-white"
          >
            {loading ? "Processing..." : "Calculate CB"}
          </button>
        </div>
      </section>

      {calculated && snapshot && (
        <div className="animate-in fade-in duration-500">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 mb-12">
            {[
              { label: "CB Before", value: kpis.cbBefore },
              { label: "Applied", value: kpis.applied },
              { label: "CB After", value: kpis.cbAfter },
              { label: "Banked Available", value: snapshot.bank.amount },
              { label: "Current Status", value: snapshot.cb.cb > 0 ? "SURPLUS" : "DEFICIT", isStatus: true },
              { label: "Reference", value: `${snapshot.cb.routeId} / ${snapshot.cb.year}` },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">{item.label}</p>
                <p className={`text-2xl font-light tracking-tighter ${
                  item.isStatus 
                    ? (snapshot.cb.cb > 0 ? "text-slate-900" : "text-red-500") 
                    : "text-slate-900"
                }`}>
                  {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Action Modules */}
          <div className="grid md:grid-cols-2 gap-12 border-t border-slate-100 pt-12">
            {/* Bank Surplus */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Banking Retention</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transfer existing surplus compliance balance into the long-term banking reserve.
                </p>
              </div>
              
              <button
                onClick={handleBank}
                disabled={!canBank || loading}
                className="w-full py-4 border border-black text-xs font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-black"
              >
                Execute Banking
              </button>

              {!canBank && (
                <p className="text-[11px] italic text-slate-400">
                  {snapshot.cb.cb <= 0 
                    ? "Retention unavailable: Compliance balance is not positive." 
                    : "Retention unavailable: Route already contains banked surplus."}
                </p>
              )}
            </div>

            {/* Apply Banked */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Compliance Offset</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Utilize banked reserves to offset current route deficits.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 bg-white border border-slate-300 p-3 text-sm focus:outline-none focus:border-black"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  placeholder="0.00"
                />
                <button
                  onClick={handleApply}
                  disabled={!canApply || loading}
                  className="px-8 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-20"
                >
                  Apply
                </button>
              </div>

              {!canApply && (
                <p className="text-[11px] italic text-slate-400">
                  Offset available only for deficit routes with sufficient banked reserves.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && !calculated && (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 border-2 border-slate-200 border-t-black animate-spin rounded-full"></div>
        </div>
      )}
    </div>
  );
};