import { Router } from "express";
import { PoolRepositoryFile } from "../../outbound/file/PoolRepositoryFile";
import { ComplianceRepositoryFile } from "../../outbound/file/ComplianceRepositoryFile";
import { CreatePool } from "../../../core/application/CreatePool";
import { GetPools } from "../../../core/application/GetPools";

const router = Router();

const poolRepo = new PoolRepositoryFile();
const complianceRepo = new ComplianceRepositoryFile();

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