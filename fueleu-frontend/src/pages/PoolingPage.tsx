import { useState } from "react";
import { usePooling } from "../adapters/ui/hooks/usePooling";

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
    return <div className="p-6">Loading...</div>;
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
    if (!createdPool) {
      return;
    }

    setSelected([]);
  };

  const filteredRoutes = routes.filter((route) => route.year === year);
  const poolSumClass =
    preview && preview.totalCB >= 0 ? "text-green-600" : "text-red-600";
  const selectedCountLabel =
    selected.length === 1 ? "1 ship selected" : `${selected.length} ships selected`;
  const isValidPool = Boolean(preview?.isValid);
  const poolsForYear = pools.filter((pool) => pool.year === year);

  const onYearChange = (nextYear: number) => {
    setYear(nextYear);
    setSelected([]);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Pooling Dashboard</h1>

      {error && <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>}
      {success && (
        <div className="rounded bg-green-100 p-3 text-green-700">{success}</div>
      )}

      <div className="rounded bg-white p-4 shadow">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold">Select Ships</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600" htmlFor="pool-year">
              Year
            </label>
            <select
              id="pool-year"
              className="rounded border p-2"
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
            >
              {[...new Set(routes.map((route) => route.year))].map((routeYear) => (
                <option key={routeYear} value={routeYear}>
                  {routeYear}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-3 text-sm text-slate-600">{selectedCountLabel}</p>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th>Select</th>
              <th>Route</th>
              <th>Vessel</th>
              <th>Year</th>
              <th>GHG</th>
            </tr>
          </thead>

          <tbody>
            {filteredRoutes.map((route) => (
              <tr key={route.routeId} className="border-t text-center">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(route.routeId)}
                    onChange={() => toggle(route.routeId)}
                  />
                </td>
                <td>{route.routeId}</td>
                <td>{route.vesselType}</td>
                <td>{route.year}</td>
                <td>{route.ghgIntensity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={calculatePool}
          disabled={selected.length < 2 || submitting}
          className={`mt-4 rounded px-4 py-2 text-white ${
            selected.length >= 2 && !submitting ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          {submitting ? "Working..." : "Calculate Pool"}
        </button>
      </div>

      {preview && preview.members.length > 0 && (
        <>
          <div className="rounded bg-white p-4 shadow">
            <h2 className="font-semibold">Pool Summary</h2>

            <p className={poolSumClass}>Pool Sum: {preview.totalCB.toFixed(2)}</p>
            <p>Status: {isValidPool ? "Valid Pool" : "Invalid Pool"}</p>

            {preview.issues.length > 0 && (
              <div className="mt-3 space-y-1 text-sm text-red-600">
                {preview.issues.map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
              </div>
            )}

            <button
              onClick={handleCreatePool}
              disabled={!isValidPool || submitting}
              className={`mt-3 rounded px-4 py-2 text-white ${
                isValidPool && !submitting ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              Create Pool
            </button>
          </div>

          <div className="rounded bg-white p-4 shadow">
            <h2 className="mb-3 font-semibold">Members</h2>

            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th>Route</th>
                  <th>Adjusted CB Before</th>
                  <th>CB After Pool</th>
                </tr>
              </thead>

              <tbody>
                {preview.members.map((member) => (
                  <tr key={member.routeId} className="border-t text-center">
                    <td>{member.routeId}</td>
                    <td>{member.cbBefore.toFixed(2)}</td>
                    <td>{member.cbAfter.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="rounded bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Existing Pools</h2>

        {poolsForYear.length === 0 ? (
          <p>No pools created for {year} yet</p>
        ) : (
          poolsForYear.map((pool) => (
            <div key={pool.id} className="mb-2 rounded border p-2">
              <p className="font-bold">Pool: {pool.id}</p>
              <p>Year: {pool.year}</p>

              {pool.members.map((member) => (
                <div key={member.routeId}>
                  {member.routeId}: {member.cb_before.toFixed(2)} to{" "}
                  {member.cb_after.toFixed(2)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
