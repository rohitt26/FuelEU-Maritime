import express from "express";
import cors from "cors";
import routesController from "../adapters/inbound/http/routes.controller";
import complianceController from "../adapters/inbound/http/compliance.controller";
import bankingController from "../adapters/inbound/http/banking.controller";
import poolController from "../adapters/inbound/http/pool.controller";
import { initDatabase } from "./db";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/pools", poolController);
app.use("/banking", bankingController);
app.use("/compliance", complianceController);
app.use("/routes", routesController);

const PORT = 3000;

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});