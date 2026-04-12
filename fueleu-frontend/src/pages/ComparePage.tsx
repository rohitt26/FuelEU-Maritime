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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Route Comparison</h1>

      {/* 📊 CHART */}
      <div className="w-full h-80 bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="routeId" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ghgIntensity" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📋 TABLE */}
      <table className="w-full border bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Route</th>
            <th>GHG Intensity</th>
            <th>% Difference</th>
            <th>Compliance</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r) => (
            <tr key={r.routeId} className="text-center border-t">
              <td className="p-2">{r.routeId}</td>

              <td>{r.ghgIntensity}</td>

              <td
                className={
                  r.percentDiff > 0 ? "text-red-500" : "text-green-500"
                }
              >
                {r.percentDiff?.toFixed(2)}%
              </td>

              <td>
                {r.compliant ? (
                  <span className="text-green-600 font-bold">✅</span>
                ) : (
                  <span className="text-red-600 font-bold">❌</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};