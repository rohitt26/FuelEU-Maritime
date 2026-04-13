import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useComparison } from "../adapters/ui/hooks/useComparison";

export const ComparePage = () => {
  const { data, loading } = useComparison();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-slate-200 border-t-black animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-slate-900">
      {/* Header Section */}
      <header className="mb-12 border-b border-black pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
          Analytics & Benchmarking
        </p>
        <h1 className="text-3xl font-light tracking-tight">Route Comparison</h1>
      </header>

      {/* Chart Section */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            GHG Intensity per Route
          </h2>
        </div>
        <div className="w-full h-80 bg-white border border-slate-200 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="routeId" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '0px', 
                  border: '1px solid black',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              />
              <Bar 
                dataKey="ghgIntensity" 
                fill="#0f172a" 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Table Section */}
      <section className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Route</th>
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">GHG Intensity</th>
              <th className="py-4 px-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">% Difference</th>
              <th className="py-4 px-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Compliance Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((r) => (
              <tr key={r.routeId} className="group hover:bg-slate-50 transition-colors">
                <td className="py-5 px-2 text-sm font-mono font-medium tracking-tight">
                  {r.routeId}
                </td>
                <td className="py-5 px-2 text-sm text-slate-600 font-medium">
                  {r.ghgIntensity}
                </td>
                <td className={`py-5 px-2 text-sm font-medium ${
                  (r.percentDiff ?? 0) > 0 ? "text-red-500" : "text-slate-900"
                }`}>
                  {(r.percentDiff ?? 0) > 0 ? "+" : ""}{(r.percentDiff ?? 0).toFixed(2)}%
                </td>
                <td className="py-5 px-2 text-right">
                  {r.compliant ? (
                    <span className="text-[10px] font-bold border border-slate-900 px-2 py-1 text-slate-900">
                      COMPLIANT
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-1">
                      NON-COMPLIANT
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-[0.2em]">
        System Time: {new Date().toLocaleTimeString()} — Analysis Complete
      </footer>
    </div>
  );
};