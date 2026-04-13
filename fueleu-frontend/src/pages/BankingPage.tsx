import { useMemo, useState } from "react";
import { useBanking } from "../adapters/ui/hooks/useBanking";
import {
  canApplyBanked,
  canBankSurplus,
  getBankingKpis,
} from "../core/application/usecases/banking";

// --- Helper Components ---

const ChevronDown = () => (
  <svg
    className="pointer-events-none absolute bottom-4 right-3 h-4 w-4 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

// --- Main Component ---

export const BankingPage = () => {
  const {
    rows,
    bank,
    selectedBalance,
    lastApplication,
    loading,
    error,
    success,
    calculateComplianceBalance,
    selectComplianceBalance,
    bankSurplus,
    applyBanked,
    clearMessages,
  } = useBanking();

  // Calculation States (Two-step selection)
  const [calcYear, setCalcYear] = useState<string>("");
  const [calcRoute, setCalcRoute] = useState<string>("");

  // Table Filter State
  const [tableYearFilter, setTableYearFilter] = useState<string>("All");

  // UI States
  const [activeKey, setActiveKey] = useState("");
  const [amount, setAmount] = useState(0);
  const [showTransactions, setShowTransactions] = useState(false);

  // --- Logic & Memos ---

  // 1. Logic for Calculation Selects
  const pendingRows = useMemo(() => rows.filter((row) => !row.isCalculated), [rows]);

  const availableCalcYears = useMemo(() => {
    const years = Array.from(new Set(pendingRows.map((r) => r.year)));
    return years.sort((a, b) => b - a);
  }, [pendingRows]);

  const routesForSelectedYear = useMemo(() => {
    return pendingRows.filter((r) => r.year === Number(calcYear));
  }, [pendingRows, calcYear]);

  // 2. Logic for Table Filtering
  const allAvailableYears = useMemo(() => {
    const years = Array.from(new Set(rows.map((r) => r.year)));
    return ["All", ...years.sort((a, b) => b - a).map(String)];
  }, [rows]);

  const filteredTableRows = useMemo(() => {
    if (tableYearFilter === "All") return rows;
    return rows.filter((r) => r.year === Number(tableYearFilter));
  }, [rows, tableYearFilter]);

  // 3. KPI & Active Row Logic
  const activeRow = useMemo(
    () => rows.find((row) => `${row.routeId}-${row.year}` === activeKey) ?? null,
    [rows, activeKey]
  );

  const snapshot =
    activeRow && selectedBalance
      ? { cb: selectedBalance, bank }
      : null;

  const kpis = getBankingKpis(snapshot, lastApplication);
  const canBank = activeRow ? canBankSurplus(snapshot) && !activeRow.alreadyBanked : false;
  const canApply = canApplyBanked(snapshot, amount);

  // --- Handlers ---

  const handleCalculate = async () => {
    if (!calcYear || !calcRoute) return;

    const balance = await calculateComplianceBalance(calcRoute, Number(calcYear));
    if (balance) {
      setActiveKey(`${calcRoute}-${calcYear}`);
      setCalcYear("");
      setCalcRoute("");
    }
  };

  const handleSelectRow = async (routeId: string, year: number) => {
    clearMessages();
    setActiveKey(`${routeId}-${year}`);
    setAmount(0);

    const target = rows.find((row) => row.routeId === routeId && row.year === year);
    if (target?.isCalculated) {
      await selectComplianceBalance(routeId, year);
    }
  };

  const handleBank = async () => {
    if (!activeRow) return;
    await bankSurplus(activeRow.routeId, activeRow.year);
  };

  const handleApply = async () => {
    if (!activeRow) return;
    await applyBanked(activeRow.routeId, activeRow.year, amount);
    setAmount(0);
  };

  return (
    <div className="mx-auto max-w-7xl p-8 text-slate-900">
      {/* Messages */}
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

      {/* Header */}
      <header className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Maritime Operations
          </p>
          <h1 className="text-3xl font-light tracking-tight">Banking Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 md:min-w-[360px]">
          <div className="bg-white p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Global Bank Balance
            </p>
            <p className="text-2xl font-light tracking-tighter">{bank.balance.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Transactions
            </p>
            <p className="text-2xl font-light tracking-tighter">{bank.transactions.length}</p>
          </div>
        </div>
      </header>

      {/* Controls: Calculation and Transactions */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-slate-200 bg-white p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Calculate Compliance Balance
          </p>
          <p className="mb-4 text-sm text-slate-500">
            Select a year, then select a route to compute the compliance balance.
          </p>

          <div className="flex flex-col gap-3 md:flex-row">
            {/* Step 1: Select Year */}
            <div className="relative flex-1">
              <select
                className="w-full appearance-none border border-slate-300 bg-white p-3 pr-10 text-sm focus:border-black focus:outline-none"
                value={calcYear}
                onChange={(e) => {
                  setCalcYear(e.target.value);
                  setCalcRoute(""); // Reset route selection if year changes
                }}
              >
                <option value="">Select Year...</option>
                {availableCalcYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown />
            </div>

            {/* Step 2: Select Route */}
            <div className="relative flex-1">
              <select
                className="w-full appearance-none border border-slate-300 bg-white p-3 pr-10 text-sm focus:border-black focus:outline-none disabled:bg-slate-50"
                value={calcRoute}
                disabled={!calcYear}
                onChange={(e) => setCalcRoute(e.target.value)}
              >
                <option value="">{calcYear ? "Select Route..." : "Choose year first"}</option>
                {routesForSelectedYear.map((row) => (
                  <option key={row.routeId} value={row.routeId}>
                    {row.routeId} - {row.vesselType}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>

            <button
              onClick={handleCalculate}
              disabled={!calcRoute || loading}
              className="border border-black bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black disabled:opacity-20"
            >
              {loading ? "Processing..." : "Calculate CB"}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Banking Transactions
              </p>
              <p className="text-sm text-slate-500">History of all actions.</p>
            </div>
            <button
              onClick={() => setShowTransactions((current) => !current)}
              className="border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 transition-all hover:border-black hover:text-black"
            >
              {showTransactions ? "Hide" : "View"}
            </button>
          </div>

          {showTransactions && (
            <div className="max-h-64 space-y-3 overflow-auto pr-1">
              {bank.transactions.length === 0 && (
                <p className="text-sm text-slate-500">No transactions recorded.</p>
              )}
              {bank.transactions.map((transaction) => (
                <div key={transaction.id} className="border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {transaction.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700">
                    {transaction.routeId} / {transaction.year} / {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Table Section */}
      <section className="mb-10 overflow-hidden border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Compliance Records
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Filter Year:</span>
            <select
              className="border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-black"
              value={tableYearFilter}
              onChange={(e) => setTableYearFilter(e.target.value)}
            >
              {allAvailableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.15em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Vessel</th>
                <th className="px-4 py-3">Fuel</th>
                <th className="px-4 py-3">CB</th>
                <th className="px-4 py-3">Bank Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTableRows.map((row) => {
                const isActive = `${row.routeId}-${row.year}` === activeKey;
                return (
                  <tr
                    key={`${row.routeId}-${row.year}`}
                    className={isActive ? "bg-slate-50" : "border-t border-slate-100"}
                  >
                    <td className="px-4 py-3 font-medium">{row.routeId}</td>
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">{row.vesselType}</td>
                    <td className="px-4 py-3">{row.fuelType}</td>
                    <td className="px-4 py-3">
                      {row.isCalculated ? (
                        <span className={row.cb !== null && row.cb < 0 ? "text-red-500" : ""}>
                          {row.cb?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not calculated</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.alreadyBanked ? "Already banked" : "Available"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleSelectRow(row.routeId, row.year)}
                        disabled={!row.isCalculated || loading}
                        className="border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all hover:border-black hover:text-black disabled:opacity-30"
                      >
                        View CB
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Details & Actions Section */}
      {activeRow && selectedBalance && (
        <section className="grid gap-8 border-t border-slate-100 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 md:grid-cols-3">
              {[
                { label: "CB Before", value: kpis.cbBefore },
                { label: "Applied", value: kpis.applied },
                { label: "CB After", value: kpis.cbAfter },
                { label: "Global Bank", value: bank.balance },
                {
                  label: "Current Status",
                  value: selectedBalance.cb > 0 ? "SURPLUS" : selectedBalance.cb < 0 ? "DEFICIT" : "BALANCED",
                },
                { label: "Reference", value: `${activeRow.routeId} / ${activeRow.year}` },
              ].map((item) => (
                <div key={item.label} className="bg-white p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {item.label}
                  </p>
                  <p className={`text-2xl font-light tracking-tighter ${typeof item.value === "number" && item.value < 0 ? "text-red-500" : "text-slate-900"}`}>
                    {typeof item.value === "number" ? item.value.toFixed(2) : item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="border border-slate-200 bg-white p-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Selected Entry</p>
              <p className="text-sm text-slate-600">
                {activeRow.routeId} / {activeRow.vesselType} / {activeRow.fuelType} / {activeRow.year}
              </p>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Bank Action */}
            <div className="border border-slate-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest">Bank Surplus</h3>
              <button
                onClick={handleBank}
                disabled={!canBank || loading}
                className="w-full border border-black py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white disabled:opacity-20"
              >
                Add To Global Bank
              </button>
              {!canBank && (
                <p className="mt-3 text-[11px] italic text-slate-400">
                  {activeRow.alreadyBanked ? "Already banked." : "Only surplus can be banked."}
                </p>
              )}
            </div>

            {/* Apply Action */}
            <div className="border border-slate-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest">Apply Bank</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 border border-slate-300 p-3 text-sm focus:border-black focus:outline-none"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
                <button
                  onClick={handleApply}
                  disabled={!canApply || loading}
                  className="bg-black px-6 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:opacity-20"
                >
                  Apply
                </button>
              </div>
              {!canApply && (
                <p className="mt-3 text-[11px] italic text-slate-400">
                  Only for deficit entries; cannot exceed bank balance.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};