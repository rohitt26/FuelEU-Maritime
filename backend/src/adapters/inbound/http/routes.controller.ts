import { Router } from "express";
import { RouteRepositoryFile } from "../../outbound/file/RouteRepositoryFile";
import { GetRoutes } from "../../../core/application/GetRoutes";
import { SetBaseline } from "../../../core/application/SetBaseline";
import { CompareRoutes } from "../../../core/application/CompareRoutes";

const router = Router();

const repo = new RouteRepositoryFile();

const getRoutes = new GetRoutes(repo);
const setBaseline = new SetBaseline(repo);
const compareRoutes = new CompareRoutes(repo);

// GET /routes
router.get("/", async (req, res) => {
  const routes = await getRoutes.execute();
  res.json(routes);
});

// POST /routes/:id/baseline
router.post("/:id/baseline", async (req, res) => {
  await setBaseline.execute(req.params.id);
  res.json({ message: "Baseline updated" });
});

// GET /routes/comparison
router.get("/comparison", async (req, res) => {
  try {
    const data = await compareRoutes.execute();
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;