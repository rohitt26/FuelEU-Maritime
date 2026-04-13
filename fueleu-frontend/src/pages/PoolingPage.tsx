import { useState } from "react";
import { usePooling } from "../adapters/ui/hooks/usePooling";

// Custom Chevron/Accordion Icon
const ChevronDown = () => (
  <svg 
    className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 bottom-3" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export const PoolingPage = () => {
  const {
    routes,
    pools,
    preview,
    loading,
    submitting,
    error,
    success,
    previewPool,
    createPool,
  } = usePooling();

  const [selected, setSelected] = useState<string[]>([]);
  const [year, setYear] = useState(2024);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-slate-200 border-t-black animate-spin rounded-full"></div>
      </div>
    );
  }

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((routeId) => routeId !== id) : [...current, id]
    );
  };

  const calculatePool = async () => {
    await previewPool(selected, year);
  };

  const handleCreatePool = async () => {
    const createdPool = await createPool(selected, year);
    if (!createdPool) return;
    setSelected([]);
  };

  const filteredRoutes = routes.filter((route) => route.year === year);
  const isValidPool = Boolean(preview?.isValid);
  const poolsForYear = pools.filter((pool) => pool.year === year);

  const onYearChange = (nextYear: number) => {
    setYear(nextYear);
    setSelected([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-slate-900">
      {/* Notifications */}
      <div className="mb-8 space-y-2">
        {error && (
          <div className="border-l-4 border-black bg-slate-50 p-4 text-sm font-medium uppercase tracking-wider">
            {error}
          </div>
        )}
        {success && (
          <div className="border-l-4 border-slate-400 bg-slate-50 p-4 text-sm font-medium uppercase tracking-wider text-slate-600">
            {success}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="mb-12 border-b border-black pb-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Fleet Compliance Aggregation</p>
          <h1 className="text-3xl font-light tracking-tight">Pooling Dashboard</h1>
        </div>
        <div className="flex flex-col items-end">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Operational Year</label>
          
          {/* Enhanced Select Wrapper */}
          <div className="relative min-w-32">
            <select
              className="w-full bg-white border border-slate-300 rounded-none p-2 pr-8 text-sm focus:outline-none focus:border-black appearance-none text-center font-bold transition-colors"
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
            >
              {[...new Set(routes.map((route) => route.year))].map((routeYear) => (
                <option key={routeYear} value={routeYear}>{routeYear}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
      </header>

      {/* ... Remaining sections (Selection, Preview, History) stay exactly the same ... */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Available Ships — <span className="text-black">{selected.length} Selected</span>
          </h2>
        </div>

        <div className="overflow-x-auto border border-slate-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-4 text-left w-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Select</th>
                <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Route ID</th>
                <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Vessel Type</th>
                <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">GHG Intensity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((route) => (
                <tr key={route.routeId} className={`group transition-colors ${selected.includes(route.routeId) ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      className="accent-black w-4 h-4 cursor-pointer"
                      checked={selected.includes(route.routeId)}
                      onChange={() => toggle(route.routeId)}
                    />
                  </td>
                  <td className="py-4 px-4 text-sm font-mono font-medium uppercase tracking-tight">{route.routeId}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{route.vesselType}</td>
                  <td className="py-4 px-4 text-sm font-medium">{route.ghgIntensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={calculatePool}
          disabled={selected.length < 2 || submitting}
          className="mt-6 w-full md:w-auto px-12 py-4 border border-black text-xs font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-black"
        >
          {submitting ? "Processing..." : "Calculate Aggregated Pool"}
        </button>
      </section>

      {/* Preview Section */}
      {preview && preview.members.length > 0 && (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-12 pt-12 border-t-2 border-black">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Pool Calculation Summary</h2>
              <div className="border border-slate-200 p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Compliance Balance</p>
                  <p className={`text-3xl font-light tracking-tighter ${preview.totalCB >= 0 ? "text-slate-900" : "text-red-500"}`}>
                    {preview.totalCB.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Integrity Status</p>
                  <span className={`text-[10px] font-bold border px-3 py-1 ${isValidPool ? "border-slate-900 text-slate-900" : "border-red-500 text-red-500 bg-red-50"}`}>
                    {isValidPool ? "VALID CONFIGURATION" : "INVALID CONFIGURATION"}
                  </span>
                </div>
                {preview.issues.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    {preview.issues.map((issue) => (
                      <p key={issue} className="text-xs text-red-600 italic mb-1">— {issue}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleCreatePool}
                  disabled={!isValidPool || submitting}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-20"
                >
                  Confirm & Finalize Pool
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Simulation Breakdown</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Route</th>
                    <th className="py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Pre-Pool</th>
                    <th className="py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Post-Pool</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.members.map((member) => (
                    <tr key={member.routeId}>
                      <td className="py-3 font-mono font-medium">{member.routeId}</td>
                      <td className="py-3 text-right text-slate-400 font-medium">{member.cbBefore.toFixed(2)}</td>
                      <td className="py-3 text-right text-black font-bold">{member.cbAfter.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* History Section */}
      <section className="pt-12 border-t border-slate-100">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">Verified Pools Archive ({year})</h2>
        {poolsForYear.length === 0 ? (
          <p className="text-xs italic text-slate-400">No established pools found for this period.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {poolsForYear.map((pool) => (
              <div key={pool.id} className="border border-slate-200 p-6 group hover:border-black transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-mono font-bold uppercase bg-slate-100 px-2 py-1 tracking-tight">ID: {pool.id}</p>
                  <p className="text-[10px] font-bold text-slate-400">{pool.year}</p>
                </div>
                <div className="space-y-2">
                  {pool.members.map((member) => (
                    <div key={member.routeId} className="flex justify-between text-xs">
                      <span className="font-mono text-slate-500">{member.routeId}</span>
                      <span className="font-medium">{member.cb_before.toFixed(2)} → <span className="font-bold">{member.cb_after.toFixed(2)}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};