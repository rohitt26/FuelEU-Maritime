import { Router } from "express";
import { PoolRepositoryPg } from "../../outbound/postgres/PoolRepositoryPg";
import { ComplianceRepositoryPg } from "../../outbound/postgres/ComplianceRepositoryPg";
import { CreatePool } from "../../../core/application/CreatePool";
import { GetPools } from "../../../core/application/GetPools";
import { PoolRepository } from "../../../core/ports/PoolRepository";
import { ComplianceRepository } from "../../../core/ports/ComplianceRepository";

type PoolControllerDeps = {
  poolRepo?: PoolRepository;
  complianceRepo?: ComplianceRepository;
};

export function createPoolController(deps: PoolControllerDeps = {}): Router {
  const router = Router();
  const poolRepo = deps.poolRepo ?? new PoolRepositoryPg();
  const complianceRepo = deps.complianceRepo ?? new ComplianceRepositoryPg();

  const createPool = new CreatePool(complianceRepo, poolRepo);
  const getPools = new GetPools(poolRepo);

  // GET /pools
  router.get("/", async (_req, res) => {
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

  return router;
}

export default createPoolController();