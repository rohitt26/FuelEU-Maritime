import { useState } from "react";
import { API_URL } from "../shared/config";
import { usePooling } from "../adapters/ui/hooks/usePooling";

export const PoolingPage = () => {
  const { routes, pools, loading, refetch } = usePooling();

  const [selected, setSelected] = useState<string[]>([]);

  if (loading) return <div className="p-6">Loading...</div>;

  // Toggle selection
  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // Create pool
  const createPool = async () => {
    await fetch(`${API_URL}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routeIds: selected,
        year: 2024,
      }),
    });

    setSelected([]);
    refetch();
  };

  // Compute total CB locally (UI validation mirror of backend)
  const selectedRoutes = routes.filter((r) =>
    selected.includes(r.routeId)
  );

  const totalCB = selectedRoutes.reduce(
    (sum, r) => sum + (r.cb || r.complianceCB || 0),
    0
  );

  const isValidPool = totalCB >= 0 && selected.length > 1;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Pooling Dashboard</h1>

      {/* 📊 ROUTE SELECTION TABLE */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-semibold mb-3">Select Ships</h2>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th>Select</th>
              <th>Route</th>
              <th>Vessel</th>
              <th>Year</th>
              <th>GHG</th>
              <th>CB (approx)</th>
            </tr>
          </thead>

          <tbody>
            {routes.map((r) => (
              <tr key={r.routeId} className="text-center border-t">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(r.routeId)}
                    onChange={() => toggle(r.routeId)}
                  />
                </td>

                <td>{r.routeId}</td>
                <td>{r.vesselType}</td>
                <td>{r.year}</td>
                <td>{r.ghgIntensity}</td>
                <td>{r.cb?.toFixed?.(2) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📉 POOL VALIDATION SUMMARY */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-semibold">Pool Validation</h2>

        <p>Total Selected: {selected.length}</p>
        <p
          className={
            totalCB >= 0 ? "text-green-600" : "text-red-600"
          }
        >
          Total CB: {totalCB.toFixed(2)}
        </p>

        {!isValidPool && (
          <p className="text-red-500 mt-2">
            ⚠ Pool invalid: must have ≥ 2 ships and total CB ≥ 0
          </p>
        )}

        <button
          disabled={!isValidPool}
          onClick={createPool}
          className={`mt-3 px-4 py-2 rounded text-white ${
            isValidPool ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          Create Pool
        </button>
      </div>

      {/* 📊 EXISTING POOLS */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-semibold mb-3">Existing Pools</h2>

        {pools.length === 0 ? (
          <p>No pools created yet</p>
        ) : (
          pools.map((p: any) => (
            <div key={p.id} className="border p-2 mb-2 rounded">
              <p className="font-bold">Pool: {p.id}</p>
              <p>Year: {p.year}</p>

              <div className="text-sm">
                {p.members.map((m: any) => (
                  <div key={m.routeId}>
                    {m.routeId}: {m.cb_before.toFixed(2)} →{" "}
                    {m.cb_after.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};