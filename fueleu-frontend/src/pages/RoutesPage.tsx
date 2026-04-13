import { useRoutes } from "../adapters/ui/hooks/useRoutes";
import { RouteApiAdapter } from "../adapters/api/RouteApiAdapter";

const api = new RouteApiAdapter();

export const RoutesPage = () => {
  const { routes } = useRoutes();

  const setBaseline = async (id: string) => {
    await api.setBaseline(id);
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-slate-900">
      {/* Header Section */}
      <header className="mb-12 border-b border-black pb-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
            Fleet Management
          </p>
          <h1 className="text-3xl font-light tracking-tight">Routes Catalog</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Total Active Routes
          </p>
          <p className="text-xl font-medium">{routes.length}</p>
        </div>
      </header>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Route ID</th>
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Vessel Type</th>
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Fuel</th>
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Year</th>
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">GHG Intensity</th>
              <th className="py-4 px-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Baseline</th>
              <th className="py-4 px-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {routes.map((r) => (
              <tr key={r.routeId} className="group hover:bg-slate-50 transition-colors">
                <td className="py-5 px-2 text-sm font-mono font-medium tracking-tight">
                  {r.routeId}
                </td>
                <td className="py-5 px-2 text-sm text-slate-600">
                  {r.vesselType}
                </td>
                <td className="py-5 px-2 text-sm text-slate-600">
                  <span className="border border-slate-200 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
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
                      className="text-[10px] font-bold uppercase tracking-widest border border-slate-300 px-4 py-2 hover:bg-black hover:border-black hover:text-white transition-all"
                    >
                      Set Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Legend */}
      <footer className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">
        <p>© 2026 Maritime Systems Inc.</p>
        <p>Data Integrity: Verified</p>
      </footer>
    </div>
  );
};