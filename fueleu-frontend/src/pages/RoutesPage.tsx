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
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Routes</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Route</th>
            <th>Vessel</th>
            <th>Fuel</th>
            <th>Year</th>
            <th>GHG</th>
            <th>Baseline</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {routes.map((r) => (
            <tr key={r.routeId} className="border-t text-center">
              <td>{r.routeId}</td>
              <td>{r.vesselType}</td>
              <td>{r.fuelType}</td>
              <td>{r.year}</td>
              <td>{r.ghgIntensity}</td>
              <td>{r.isBaseline ? "✅" : ""}</td>
              <td>
                <button
                  onClick={() => setBaseline(r.routeId)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Set Baseline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};