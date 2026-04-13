import { useState, useMemo } from "react";
import { useRoutes } from "../adapters/ui/hooks/useRoutes";
import { RouteApiAdapter } from "../adapters/api/RouteApiAdapter";

const api = new RouteApiAdapter();

// Define initial state outside to reuse for resetting
const initialFilters = {
  routeId: "",
  vesselType: "",
  fuelType: "",
  year: "",
};

export const RoutesPage = () => {
  const { routes } = useRoutes();
  const [filters, setFilters] = useState(initialFilters);

  // --- Derived State: Active Baseline ---
  const activeBaseline = useMemo(() => routes.find((r) => r.isBaseline), [routes]);

  // --- Get Unique Values for Dropdowns ---
  const options = useMemo(() => {
    return {
      vessels: Array.from(new Set(routes.map((r) => r.vesselType))),
      fuels: Array.from(new Set(routes.map((r) => r.fuelType))),
      years: Array.from(new Set(routes.map((r) => r.year))).sort().reverse(),
    };
  }, [routes]);

  // --- Filtering Logic ---
  const filteredRoutes = routes.filter((r) => {
    return (
      r.routeId.toLowerCase().includes(filters.routeId.toLowerCase()) &&
      (filters.vesselType === "" || r.vesselType === filters.vesselType) &&
      (filters.fuelType === "" || r.fuelType === filters.fuelType) &&
      (filters.year === "" || r.year.toString() === filters.year)
    );
  });

  const setBaseline = async (id: string) => {
    try {
      await api.setBaseline(id);
      window.location.reload();
    } catch (error) {
      console.error("Failed to set baseline:", error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  // Check if any filter is currently applied to show/hide reset button
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(initialFilters);

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-slate-900">
      {/* Header Section */}
      <header className="mb-8 border-b border-black pb-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
            Fleet Management
          </p>
          <h1 className="text-3xl font-light tracking-tight">Routes Catalog</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Results
          </p>
          <p className="text-xl font-medium">
            {filteredRoutes.length} <span className="text-slate-300 mx-1">/</span> {routes.length}
          </p>
        </div>
      </header>

      {/* Baseline Reference Banner */}
      <section className="mb-12 bg-slate-50 border border-slate-200 p-6 flex flex-wrap gap-12 items-center">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Active Baseline
          </p>
          {activeBaseline ? (
            <div className="flex items-baseline gap-4">
              <h2 className="text-xl font-mono font-medium">{activeBaseline.routeId}</h2>
              <span className="text-xs text-slate-500">{activeBaseline.vesselType} • {activeBaseline.year}</span>
            </div>
          ) : (
            <h2 className="text-xl font-light text-slate-400 italic">No Baseline Selected</h2>
          )}
        </div>
        
        {activeBaseline && (
          <div className="grid grid-cols-2 gap-8 border-l border-slate-200 pl-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GHG Intensity</p>
              <p className="text-2xl font-light">{activeBaseline.ghgIntensity}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fuel Type</p>
              <p className="text-xs font-bold uppercase mt-1 border border-black inline-block px-2 py-1">
                {activeBaseline.fuelType}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Filter Bar with Reset Option */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Filters</h3>
          {isFiltered && (
            <button 
              onClick={resetFilters}
              className="text-[10px] font-bold uppercase tracking-widest
              bg-white text-red-500 border border-red-300
              px-3 py-1 rounded
              transition-colors duration-150
              hover:bg-red-500 hover:text-white hover:border-red-500"
            >
              Reset All Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search ID</label>
            <input
              type="text"
              name="routeId"
              value={filters.routeId}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="border-b border-slate-200 py-2 text-sm focus:border-black outline-none transition-colors bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vessel Type</label>
            <select
              name="vesselType"
              value={filters.vesselType}
              onChange={handleFilterChange}
              className="border-b border-slate-200 py-2 text-sm focus:border-black outline-none transition-colors bg-transparent"
            >
              <option value="">All Vessels</option>
              {options.vessels.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fuel</label>
            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={handleFilterChange}
              className="border-b border-slate-200 py-2 text-sm focus:border-black outline-none transition-colors bg-transparent"
            >
              <option value="">All Fuels</option>
              {options.fuels.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="border-b border-slate-200 py-2 text-sm focus:border-black outline-none transition-colors bg-transparent"
            >
              <option value="">All Years</option>
              {options.years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="w-[14.28%] py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Route ID</th>
              <th className="w-[14.28%] py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Vessel Type</th>
              <th className="w-[14.28%] py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Fuel</th>
              <th className="w-[14.28%] py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Year</th>
              <th className="w-[14.28%] py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">GHG Intensity</th>
              <th className="w-[14.28%] py-4 px-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Baseline</th>
              <th className="w-[14.28%] py-4 px-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredRoutes.map((r) => (
              <tr key={r.routeId} className="group hover:bg-slate-50 transition-colors">
                <td className="py-5 px-2 text-sm font-mono font-medium tracking-tight truncate">
                  {r.routeId}
                </td>
                <td className="py-5 px-2 text-sm text-slate-600 truncate">
                  {r.vesselType}
                </td>
                <td className="py-5 px-2 text-sm text-slate-600">
                  <span className="border border-slate-200 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider inline-block">
                    {r.fuelType}
                  </span>
                </td>
                <td className="py-5 px-2 text-sm text-slate-600">
                  {r.year}
                </td>
                <td className="py-5 px-2 text-sm font-medium">
                  {r.ghgIntensity}
                </td>
                <td className="py-5 px-2 text-center">
                  {r.isBaseline ? (
                    <span className="text-xs font-bold bg-black text-white px-2 py-1">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-slate-200">—</span>
                  )}
                </td>
                <td className="py-5 px-2 text-right">
                  {!r.isBaseline && (
                    <button
                      onClick={() => setBaseline(r.routeId)}
                      className="text-[10px] font-bold uppercase tracking-widest border border-slate-300 px-4 py-2 hover:bg-black hover:border-black hover:text-white transition-all whitespace-nowrap"
                    >
                      Set Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRoutes.length === 0 && (
          <div className="py-20 text-center text-slate-400 text-xs uppercase tracking-widest">
            No matching routes found
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">
        <p>© 2026 Maritime Systems Inc.</p>
        <p>Data Integrity: Verified</p>
      </footer>
    </div>
  );
};