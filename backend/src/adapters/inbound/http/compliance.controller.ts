import { Router } from "express";
import { RouteRepositoryPg } from "../../outbound/postgres/RouteRepositoryPg";
import { ComplianceRepositoryPg } from "../../outbound/postgres/ComplianceRepositoryPg";
import { ComputeCB } from "../../../core/application/ComputeCB";
import { GetAdjustedCB } from "../../../core/application/GetAdjustedCB";

const router = Router();

const routeRepo = new RouteRepositoryPg();
const complianceRepo = new ComplianceRepositoryPg();

const computeCB = new ComputeCB(routeRepo, complianceRepo);
const getAdjustedCB = new GetAdjustedCB(complianceRepo);

// GET /compliance/records
router.get("/records", async (_req, res) => {
  const records = await complianceRepo.getAll();
  res.json(records);
});

// GET /compliance/cb
router.get("/cb", async (req, res) => {
  try {
    const { routeId, year } = req.query;

    if (!routeId || !year) {
      return res.status(400).json({
        error: "routeId and year are required"
      });
    }

    const result = await complianceRepo.find(routeId as string, Number(year));

    if (!result) {
      return res.status(404).json({
        error: "CB not computed yet"
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /compliance/cb
router.post("/cb", async (req, res) => {
  try {
    const { routeId, year } = req.body;

    if (!routeId || !year) {
      return res.status(400).json({
        error: "routeId and year are required"
      });
    }

    const result = await computeCB.execute(routeId, Number(year));
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
