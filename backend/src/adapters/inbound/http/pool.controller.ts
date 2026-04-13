import { Router } from "express";
import { PoolRepositoryPg } from "../../outbound/postgres/PoolRepositoryPg";
import { ComplianceRepositoryPg } from "../../outbound/postgres/ComplianceRepositoryPg";
import { CreatePool } from "../../../core/application/CreatePool";
import { GetPools } from "../../../core/application/GetPools";

const router = Router();

const poolRepo = new PoolRepositoryPg();
const complianceRepo = new ComplianceRepositoryPg();

const createPool = new CreatePool(complianceRepo, poolRepo);
const getPools = new GetPools(poolRepo);

// GET /pools
router.get("/", async (req, res) => {
  const pools = await getPools.execute();
  res.json(pools);
});

// POST /pools
router.post("/", async (req, res) => {
  try {
    const { routeIds, year } = req.body;

    const pool = await createPool.execute(routeIds, year);

    res.json(pool);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;