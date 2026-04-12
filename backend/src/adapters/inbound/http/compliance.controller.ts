import { Router } from "express";
import { RouteRepositoryFile } from "../../outbound/file/RouteRepositoryFile";
import { ComplianceRepositoryFile } from "../../outbound/file/ComplianceRepositoryFile";
import { ComputeCB } from "../../../core/application/ComputeCB";
import { GetAdjustedCB } from "../../../core/application/GetAdjustedCB";

const router = Router();

const routeRepo = new RouteRepositoryFile();
const complianceRepo = new ComplianceRepositoryFile();

const computeCB = new ComputeCB(routeRepo, complianceRepo);
const getAdjustedCB = new GetAdjustedCB(complianceRepo);

// GET /compliance/cb
router.get("/cb", async (req, res) => {
  try {
    const { routeId, year } = req.query;

    if (!routeId || !year) {
      return res.status(400).json({ error: "routeId and year required" });
    }

    const result = await computeCB.execute(
      routeId as string,
      Number(year)
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /compliance/adjusted-cb
router.get("/adjusted-cb", async (req, res) => {
  try {
    const { routeId, year } = req.query;

    const result = await getAdjustedCB.execute(
      routeId as string,
      Number(year)
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;